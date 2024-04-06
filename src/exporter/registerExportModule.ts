import joplin from "api";
import { FileSystemItem } from "api/types";
import * as FsExtraType from "fs-extra";
import { join } from "path";
import { getSettings } from "../settings";

const registerHtmlExportModule = async () => {
	let fs_: (typeof FsExtraType)|null = null;
	// Require fs-extra dynamically to support mobile.
	const fs = (): typeof FsExtraType => {
		fs_ ??= joplin.require('fs-extra') as typeof FsExtraType;
		return fs_;
	};

	async function* forEachFileInDirectory(basePath: string): AsyncGenerator<string> {
		const files = await fs().readdir(basePath);
		for (const fileName of files) {
			const filePath = join(basePath, fileName);
			const stat = await fs().stat(filePath);
			if (stat.isDirectory()) {
				for await (const subpath of forEachFileInDirectory(filePath)) {
					yield subpath;
				}
			} else if (stat.isFile()) {
				yield filePath;
			}
		}
	}

	let presentationScriptHtml = '';
	await joplin.interop.registerExportModule({
		description: 'Export presentation as HTML',
		// Use .presentation.html to distinguish this exporter from the HTML exporter.
		format: 'presentation.html',
		target: FileSystemItem.Directory,
		isNoteArchive: false,

		onInit: async () => {
			const installationDir = await joplin.plugins.installationDir();

			const webviewSetupScriptPath = join(installationDir, 'exporter', 'webviewSetup.js');
			const presentationSetupScript = await fs().readFile(webviewSetupScriptPath, 'utf8');

			const scriptPath = join(installationDir, 'dialog', 'webview', 'webview.js');
			const presentationScript = await fs().readFile(scriptPath, 'utf8');

			const stylePath = join(installationDir, 'dialog', 'webview', 'webview.css');
			const styleCss = await fs().readFile(stylePath, 'utf8');

			presentationScriptHtml = `
				<script>${presentationSetupScript}</script>
				<script>${presentationScript}</script>
				<style>
					${styleCss}

					/* The note title and header. */
					.exported-note {
						display: none;
					}
				</style>
			`;
		},
		onProcessItem: async (_context, _itemType, _item) => {},
		onProcessResource: async (_context, _resource, _filePath) => { },
		onClose: async (context)=> {
			const noteIds = context.options.sourceNoteIds ?? context.userData?.noteIds;
			if (noteIds) {
				const settingsHtml = `
					<script>
						window.presentationSettings = ${JSON.stringify(await getSettings())}
					</script>
				`;

				const outputPath = join(context.destPath, 'presentation');
				await fs().mkdirp(outputPath);

				// Because plugins can't run Joplin's renderer, first export from Joplin, then
				// process the exported files.
				await joplin.commands.execute('exportNotes', noteIds, 'html', outputPath);

				for await (const filePath of forEachFileInDirectory(context.destPath)) {
					const isExportedHtmlFile = filePath.endsWith('.html') && !filePath.endsWith('.presentation.html');
					if (isExportedHtmlFile) {
						const fileContent = await fs().readFile(filePath, 'utf8');
						const outputHtml = fileContent + settingsHtml + presentationScriptHtml;
						await fs().writeFile(filePath, outputHtml, 'utf8');
						await fs().move(filePath, filePath.replace(/\.html$/, '.presentation.html'));
					}
				}
			}
		},
	});
};

export default registerHtmlExportModule;