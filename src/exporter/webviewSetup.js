// This file sets up the exported HTML file for a presentation.
// It mocks webviewApi to support the presentation script.

// Prevents a warning
var exports = {};

let initialData = '';
const renderedMarkdown = document.querySelector('#rendered-md');
if (renderedMarkdown) {
	initialData = renderedMarkdown.innerHTML;
} else {
	initialData = document.body.innerHTML;
	document.body.replaceChildren();
}

const isPrintView = location.href.endsWith('?print');

window.webviewApi = {
	postMessage: async (message) => {
		if (message.type === 'getInitialData') {
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
		}
	},
	onMessage: (_listener) => { },
};