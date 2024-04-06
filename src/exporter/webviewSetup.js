// This file sets up the exported HTML file for a presentation.
// It mocks webviewApi to support the presentation script.

// Prevents a warning
var exports = {};

const isPrintView = location.href.endsWith('?print');

const loadPromise = new Promise(resolve => {
	document.addEventListener('DOMContentLoaded', () => resolve());
});

loadPromise.then(() => {
	document.body.classList.add('loaded-exported-presentation');
});

// Cache a copy of window.open -- the main webview code may attempt to remove/override
// it.
const openNewTab = window.open;
window.webviewApi = {
	postMessage: async (message) => {
		if (message.type === 'getInitialData') {
			await loadPromise;

			let initialData = '';
			const renderedMarkdown = document.querySelector('#rendered-md');
			if (renderedMarkdown) {
				initialData = renderedMarkdown.innerHTML;
			} else {
				initialData = document.body.innerHTML;
				document.body.replaceChildren();
			}

			return {
				type: 'initialDataResponse',
				initialData,
				settings: {
					...window.presentationSettings,
					printView: isPrintView,
				},
			};
		} else if (message.type === 'print' && !isPrintView) {
			location.href += '?print';
		} else if (message.type === 'openLink') {
			openNewTab(message.href, '_blank');
		}
	},
	onMessage: (_listener) => { },
};