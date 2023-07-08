import localization from '../localization';
import { InitialDataRequest, WebViewMessage, WebViewMessageResponse } from '../types';

import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

// Allows math rendered within Joplin to work
import 'katex/dist/katex.min.css';

// Allows syntax highlighting in code blocks
import 'reveal.js/plugin/highlight/zenburn.css';

type WebViewAPI = {
	postMessage(message: WebViewMessage): Promise<WebViewMessageResponse>;
}
declare const webviewApi: WebViewAPI;

// Convert content between <hr/> elements into <section> elements.
const hrToSections = (container: HTMLElement) => {
	const slides = [];
	let currentSide = document.createElement('section');
	for (const node of container.childNodes) {
		if (node.nodeName === 'HR') {
			slides.push(currentSide);
			currentSide = document.createElement('section');
		} else {
			currentSide.appendChild(node.cloneNode(true));
		}
	}
	slides.push(currentSide);
	container.replaceChildren(...slides);
};

const initializeRevealElements = (presentationHTML: string) => {
	const revealContainer = document.createElement('div');
	revealContainer.classList.add('reveal');
	const slidesContainer = document.createElement('div');

	slidesContainer.classList.add('slides');
	revealContainer.appendChild(slidesContainer);
	slidesContainer.innerHTML = presentationHTML;

	// Convert <hr/> elements into <section> elements so users can separate
	// slides with "---"s in markdown
	hrToSections(slidesContainer);

	// Add an additional, empty slide
	const lastSlide = document.createElement('section');
	lastSlide.innerText = localization.endOfDeck;
	slidesContainer.appendChild(lastSlide);

	return revealContainer;
};

const showCloseButton = () => {
	webviewApi.postMessage({
		type: 'showCloseBtn',
	});
};

const hideCloseButton = () => {
	webviewApi.postMessage({
		type: 'hideCloseBtn',
	});
};

// Load initial data
const loadedMessage: InitialDataRequest = {
	type: 'getInitialData',
};
webviewApi.postMessage(loadedMessage).then((result: WebViewMessageResponse) => {
	if (result?.type === 'initialDataResponse') {
		const revealElements = initializeRevealElements(result.initialData ?? 'no initial data');
		document.body.appendChild(revealElements);
		
		const deck = new Reveal({ });

		deck.addKeyBinding({
			keyCode: 81,
			key: 'q',
			description: localization.showExitButton
		}, () => {
			showCloseButton();
		});

		deck.addKeyBinding({
			keyCode: 80,
			key: 'p',
			description: localization.print
		}, () => {
			window.print();
		});

		deck.on('slidechanged', () => {
			if (deck.isLastSlide()) {
				showCloseButton();
			} else {
				hideCloseButton();
			}
		});

		deck.initialize();
	}
});
