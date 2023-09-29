
// Sandbox all iframes created by reveal.js.
const origCreateElement = Document.prototype.createElement;
Document.prototype.createElement = function(name: string) {
	if (name.toLowerCase() === 'iframe') {
		const iframe = origCreateElement.call(this, 'iframe');
		iframe.setAttribute('sandbox', '');
		return iframe;
	}
	return origCreateElement.call(this, name);
};

// Override most window creation. Wrap the content of windows that are created in
// a sandboxed iframe.
(() => {
	const originalWindowOpen = window.open;
	const newWindowOpen = (url: string|URL|undefined) => {
		// Try to limit what is allowed to open new windows
		if (url !== 'about:blank') {
			return null;
		}

		const win = originalWindowOpen('about:blank', '_blank', 'popup');
		if (!win?.document) {
			return null;
		}

		win.document.open();
		win.document.write(`
			<!DOCTYPE html>
			<html>
			<body>
			</body>
			</html>
		`);
		win.document.close();

		const iframe = win.document.createElement('iframe');
		iframe.src = 'about:blank';

		// Disallow everything except scripts.
		// Note that allow-same-origin is required to use document.write.
		// More on the iframe sandbox attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox
		iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

		// Only allow resources from about:blank
		iframe.setAttribute('csp', 'default-src \'about:blank\'');

		iframe.style.position = 'fixed';
		iframe.style.width = '100vw';
		iframe.style.height = '100vh';
		iframe.style.top = '0';
		iframe.style.left = '0';
		win.document.body.appendChild(iframe);

		const iframeWindow = iframe.contentWindow!;

		iframeWindow.onerror = (err) => {
			iframeWindow.document.body.appendChild(document.createTextNode('ERR' +err));
		};
		iframeWindow.onunhandledrejection = (err) => {
			iframeWindow.document.body.appendChild(document.createTextNode('ERR2' +err));
		};

		// The speaker-view window checks whether the new window has the same origin
		// as its opener before running. However, the new window will be running in
		// an iframe.
		// Mock opener.location.origin.
		iframeWindow.opener = {
			location: {
				origin: iframe.contentWindow?.origin + '',
			},

			// Also override postMessage, as it is used to communicate with
			// the speaker-view plugin.
			postMessage: (message: string) => {
				const targetOrigin = window.location.origin;
				window.postMessage(message, targetOrigin);
			},
		};

		return iframeWindow;
	};

	Window.prototype.open = newWindowOpen;
	window.open = newWindowOpen;
})();

import localization from '../localization';
import { InitialDataRequest, WebViewMessage, WebViewMessageResponse } from '../types';

import Reveal from 'reveal.js';
const RevealSearch = require('reveal.js/plugin/search/search.esm.js').default;
const RevealSlideNotes = require('reveal.js/plugin/notes/notes.esm.js').default;
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

// Allows math rendered within Joplin to work
import 'katex/dist/katex.min.css';

// Allows syntax highlighting in code blocks
import 'reveal.js/plugin/highlight/zenburn.css';

// Prevent navigation away from the current window (e.g. by improperly sanitized links) or by
// some unknown reveal.js functionality.
window.onbeforeunload = () => {
	console.log('RevealJS integration: Security: Preventing navigation away from window.')
	window.close();
	showCloseButton();
};

type WebViewAPI = {
	postMessage(message: WebViewMessage): Promise<WebViewMessageResponse>;
}
declare const webviewApi: WebViewAPI;

// Returns children that are not comments and are not space-only text nodes.
const getNonEmptyChildren = (parent: HTMLElement) => {
	return [ ...parent.childNodes ]
		.filter(node => {
			const isComment = node.nodeName === '#comment';
			const isText = node.nodeName === '#text';
			return !isComment && (!isText || node.nodeValue?.trim() !== '');
		});
};

// Convert content between <hr/> elements into <section> elements.
const hrToSections = (container: HTMLElement) => {
	// If the container has <section>s and not <hr/>s, do nothing.
	if (container.querySelector(':scope > section') && !container.querySelector(':scope > hr')) {
		return;
	}

	const slides: ChildNode[] = [];
	let currentSide = document.createElement('section');

	const finalizeSlide = () => {
		const children = getNonEmptyChildren(currentSide);

		// Avoid having a single <section/> within a <section/>
		if (children.length === 1 && children[0].nodeName === 'SECTION') {
			currentSide = children[0] as HTMLElement;
			console.log('RevealJS integration: Section contains only a single section: replacing with only child');
		}

		slides.push(currentSide);
		currentSide = document.createElement('section');
	};

	for (const node of container.childNodes) {
		if (node.nodeName === 'HR') {
			finalizeSlide();
		} else {
			currentSide.appendChild(node.cloneNode(true));
		}
	}
	finalizeSlide();

	container.replaceChildren(...slides);
};

const rewriteLinks = (container: HTMLElement) => {
	const links: NodeListOf<HTMLElement> = container.querySelectorAll('*[href]');
	for (const link of links) {
		// Allow stylesheet links
		if (link.tagName === 'LINK' && link.getAttribute('rel') === 'stylesheet') {
			continue;
		}

		const href = link.getAttribute('href');
		const isResourceLink = link.hasAttribute('data-resource-id');

		if (href && (!href.startsWith('#') || isResourceLink)) {
			link.removeAttribute('href');
			link.removeAttribute('onclick');
			
			// Ensure that the link can still be focused, even though we removed its href
			link.setAttribute('tabindex', '0');

			let targetHref = href;

			// Handle resource links
			if (isResourceLink) {
				targetHref = ':/' + link.getAttribute('data-resource-id');
			}

			link.onclick = () => {
				webviewApi.postMessage({
					type: 'openLink',
					href: targetHref,
				});
			};
		}
	}
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
	rewriteLinks(slidesContainer);

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

const toggleCloseButton = () => {
	webviewApi.postMessage({
		type: 'toggleCloseBtn',
	});
};

const initializeDeck = async () => {
	const deck = new Reveal({
		// Make [first slide](#1) link to the first slide
		hashOneBasedIndex: true,
		plugins: [ RevealSearch, RevealSlideNotes ],
		showNotes: true,
	});

	deck.addKeyBinding({
		keyCode: 81,
		key: 'q',
		description: localization.showExitButton
	}, () => {
		toggleCloseButton();
	});

	// Remap ESC
	deck.removeKeyBinding(27);
	deck.addKeyBinding({
		keyCode: 27,
		key: 'ESC',
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

	await deck.initialize();
};

// Load initial data
const loadedMessage: InitialDataRequest = {
	type: 'getInitialData',
};
webviewApi.postMessage(loadedMessage).then((result: WebViewMessageResponse) => {
	if (result?.type === 'initialDataResponse') {
		const revealElements = initializeRevealElements(result.initialData ?? 'no initial data');
		document.body.appendChild(revealElements);

		if (result.settings.scrollsOverflow) {
			document.body.classList.add('allowSlidesOverflow');
		}

		void initializeDeck();
	}
});
