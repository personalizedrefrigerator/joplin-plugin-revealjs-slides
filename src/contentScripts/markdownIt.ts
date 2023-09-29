import type MarkdownIt = require("markdown-it");

//declare const webviewApi: any;

export default (context: { contentScriptId: string }) => {
	return {
		plugin: (markdownIt: MarkdownIt, _options: any) => {
			const originalRender = markdownIt.render;
			markdownIt.render = (...args: any) => {
				let result = originalRender.apply(markdownIt, args);

				// Append content that sends the rendered markdown to the plugin's content script.
				const postRenderedMd = `
					const renderedMd = document.querySelector('#rendered-md');
					const assetsContainer = document.querySelector('#joplin-container-pluginAssetsContainer');
					if (renderedMd) {
						let html = '';
						/* Include plugin assets & custom stylesheets, if available. */
						if (assetsContainer) {
							html += assetsContainer.outerHTML;
						}

						html += renderedMd.innerHTML;

						try {
							webviewApi.postMessage('${context.contentScriptId}', html);
						} catch(e) {
							// Do nothing, webviewApi is unavailable in the rich text editor
							// (so avoid logging).
						}
					}
				`;
				result += `<style onload="${postRenderedMd}"></style>`;

				return result;
			};
		},
	}
}