declare const webviewApi: any;

const contentScriptId = 'personalizedrefrigerator-revealjs-slides-plugin-markdownItPlugin';

const sendNoteContent = () => {
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
			webviewApi.postMessage(contentScriptId, { type: 'updateHtml', html });
		} catch(e) {
			// Do nothing, webviewApi is unavailable in the rich text editor
			// (so avoid logging).
		}
	}
};

(async () => {
	while (true) {
		await webviewApi.postMessage(contentScriptId, { type: 'waitForHtmlRequest' });
		sendNoteContent();
	}
})();