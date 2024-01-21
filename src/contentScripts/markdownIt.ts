import type MarkdownIt = require("markdown-it");

//declare const webviewApi: any;

export default (context: { contentScriptId: string }) => {
	return {
		plugin: (markdownIt: MarkdownIt, _options: any) => {
			const originalRender = markdownIt.renderer.render;
			markdownIt.renderer.render = (...args: any) => {
				let result = originalRender.apply(markdownIt.renderer, args);

				// Append content that sends the rendered markdown to the plugin's content script.
				const postRenderedMd = `
					const assetsContainer = document.querySelector('#joplin-container-pluginAssetsContainer');

					/*
					 In some cases (e.g. HTML notes, renderedMD is undefined). Sections need to be in the root element,
					 so try to return the content element.
					*/
					const mainHtmlElement =
						document.querySelector('#rendered-md')
						?? document.querySelector('#joplin-container-content')
						?? document.body;

					if (mainHtmlElement) {
						let html = '';

						if (mainHtmlElement !== document.body) {
							/* Include plugin assets & custom stylesheets, if available. */
							if (assetsContainer) {
								html += assetsContainer.outerHTML;
							}
						}

						html += mainHtmlElement.innerHTML;

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