import joplin from 'api';
import { ContentScriptType, ToolbarButtonLocation } from 'api/types';
import localization from './localization';
import PresentationDialog from './dialog/PresentationDialog';
import { pluginPrefix } from './constants';
import waitFor from './util/waitFor';


// Returns true if the CodeMirror editor is active.
const isMarkdownEditor = async () => {
	return await joplin.commands.execute('editor.execCommand', {
		name: 'revealJSIntegration--isCodeMirrorActive',
	}) === 'active';
};

joplin.plugins.register({
	onStart: async function() {
		const presentationDialog = await PresentationDialog.getInstance();
		const toolbuttonCommand = `${pluginPrefix}insertDrawing`;

		let renderedContent = '';
		const startSlideshow = async () => {
			const wasMarkdownEditor = await isMarkdownEditor();

			// MCE or Joplin has a bug where inserting markdown code for an SVG image removes
			// the image data. See https://github.com/laurent22/joplin/issues/7547.
			if (!wasMarkdownEditor) {
				// Switch to the markdown editor.
				await joplin.commands.execute('toggleEditors');

				// Delay: Ensure we're really in the CodeMirror editor.
				await waitFor(100);
			}

			presentationDialog.present(renderedContent);

			// Try to switch back to the original editor
			if (!wasMarkdownEditor) {
				await joplin.commands.execute('toggleEditors');
			}
		};

		await joplin.commands.register({
			name: toolbuttonCommand,
			label: localization.startSlideshow,
			iconName: 'fas fa-play',
			execute: async () => {
				// Force a re-render by switching to the plain text editor
				startSlideshow();
			},
		});

		await joplin.views.toolbarButtons.create(
			toolbuttonCommand, toolbuttonCommand, ToolbarButtonLocation.EditorToolbar
		);

		const markdownItContentScriptId = `${pluginPrefix}markdownItPlugin`;
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			markdownItContentScriptId,
			'./contentScripts/markdownIt.js',
		);
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (renderedHTML: string) => {
			renderedContent = renderedHTML;
		});
	},
});
