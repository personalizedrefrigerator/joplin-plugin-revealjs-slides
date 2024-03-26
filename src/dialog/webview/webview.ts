
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

// Also prevent reveal.js from opening popup windows.
Window.prototype.open = () => null;
window.open = () => null;

declare global {
	interface Window {
		jopIsNewOriginWindow?: boolean;
	}
}

import localization from '../../localization';
import { InitialDataRequest, PresentationSettings, WebViewMessage, WebViewMessageResponse } from '../../types';

import Reveal from 'reveal.js';
const RevealSearch = require('reveal.js/plugin/search/search.esm.js').default;
const RevealHighlight = require('reveal.js/plugin/highlight/highlight.esm.js').default;
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

// Allows math rendered within Joplin to work
import 'katex/dist/katex.min.css';

// Allows syntax highlighting in code blocks
import 'reveal.js/plugin/highlight/zenburn.css';

import showOpenSourceLicenses from './licenses/showOpenSourceLicenses';
import openPrintPreview from './util/openPrintPreview';

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

const rewriteLinks = (container: HTMLElement, settings: PresentationSettings) => {
	const links: NodeListOf<HTMLElement> = container.querySelectorAll('*[href]');
	for (const link of links) {
		// Allow stylesheet links
		if (link.tagName === 'LINK' && link.getAttribute('rel') === 'stylesheet') {
			continue;
		}

		const href = link.getAttribute('href');
		const isResourceLink = link.hasAttribute('data-resource-id');

		if (href && (!href.match(/^#.+/) || isResourceLink)) {
			// We need to preserve the href attribute when printing to PDF.
			if (!settings.printView) {
				link.removeAttribute('href');
			}
			link.removeAttribute('onclick');
			
			// Ensure that the link can still be focused, even though we removed its href
			link.setAttribute('tabindex', '0');

			let targetHref = href;

			// Handle resource links
			if (isResourceLink) {
				targetHref = ':/' + link.getAttribute('data-resource-id');
			}

			link.onclick = (event) => {
				event.preventDefault();
				webviewApi.postMessage({
					type: 'openLink',
					href: targetHref,
				});
			};
		}
	}
};

const removeObjects = (container: HTMLElement) => {
	// Object embeds prevent printing.
	for (const obj of container.querySelectorAll('object')) {
		obj.remove();
	}
};

const initializeRevealElements = (presentationHTML: string, settings: PresentationSettings) => {
	const revealContainer = document.createElement('div');
	revealContainer.classList.add('reveal');
	const slidesContainer = document.createElement('div');

	slidesContainer.classList.add('slides');
	revealContainer.appendChild(slidesContainer);
	slidesContainer.innerHTML = presentationHTML;

	// Convert <hr/> elements into <section> elements so users can separate
	// slides with "---"s in markdown
	hrToSections(slidesContainer);
	rewriteLinks(slidesContainer, settings);
	if (settings.printView) {
		removeObjects(slidesContainer);
	}

	// Add an additional, empty slide
	if (!settings.printView) {
		const lastSlide = document.createElement('section');
		lastSlide.innerText = localization.endOfDeck;
		slidesContainer.appendChild(lastSlide);
	}

	return revealContainer;
};

const initializeCodeHighlighting = async (deckContent: HTMLElement) => {
	// Manually highlight code blocks that haven't been rendered by Joplin.
	// See https://revealjs.com/code/#manual-highlighting

	// Note: We need to highlight by calling methods of RevealHighlight manually
	// because some changes are made to *all* `pre code` elements if the plugin is loaded
	// as expected.
	const highlightPlugin = RevealHighlight();

	const highlightableElements
		= deckContent.querySelectorAll<HTMLElement>('pre.jop-noMdConv:not(.hljs) > code.jop-noMdConv');

	for (const elem of highlightableElements) {
		const pre = elem.parentElement;

		// Only highlight if the element has specific attributes (don't highlight all
		// pre > codes)
		const needsHighlightAttrs = [
			'data-line-numbers',
			'data-ln-start-from',
			'data-trim',
			'data-noescape',
			'data-highlight',
			'data-rjs-highlight',
		];

		const needsHighlight = needsHighlightAttrs.some(attr => elem.hasAttribute(attr));

		if (pre && needsHighlight) {
			pre.classList.add('code-wrapper', 'rjs-code-wrapper');

			// Emulate some of the reveal.js setup code.
			// See options here: https://revealjs.com/code/#manual-highlighting

			const scriptReplacementMatches = elem.querySelectorAll(':scope > script[type="text/template"], :scope > textarea[data-template-text]');
			if (scriptReplacementMatches.length === 1) {
				elem.innerText = scriptReplacementMatches[0].innerHTML;
			}

			if (elem.hasAttribute('data-noescape')) {
				elem.innerText = elem.innerHTML;
			}

			if (elem.hasAttribute('data-trim')) {
				elem.innerHTML = elem.innerHTML.replace(/^\s*[\n]/g, '').trimEnd();
			}

			highlightPlugin.highlightBlock(elem);
		}
	}
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

const initializeDeck = async (settings: PresentationSettings, deckContent: HTMLElement) => {
	const deck = new Reveal(deckContent, {
		// Make [first slide](#1) link to the first slide
		hashOneBasedIndex: true,

		// Do not add RevealHighlight as a plugin (breaks Joplin's search.)
		plugins: [ RevealSearch ],

		// Don't re-highlight Joplin's highlighted output
		highlight: {
			highlightOnLoad: false,
			escapeHTML: true,
		} as any,

		showNotes: settings.showSpeakerNotes,

		...(settings.printView ? { view: 'print' } : undefined),
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
		description: localization.print,
	}, () => {
		void openPrintPreview();
	});

	deck.on('slidechanged', () => {
		if (deck.isLastSlide()) {
			showCloseButton();
		} else {
			hideCloseButton();
		}
	});

	await deck.initialize();
	await initializeCodeHighlighting(deckContent);

	// Show after the other shortcuts
	deck.registerKeyboardShortcut('Shift + i', 'Show OpenSource licenses');
	
	if (settings.printView) {
		document.title = 'Print preview';

		const printButton = document.createElement('button');
		printButton.classList.add('print-button', 'action-button');
		printButton.innerText = localization.print;

		printButton.onclick = () => {
			window.print();
		};

		document.body.appendChild(printButton);
		showCloseButton();
	}
};

document.addEventListener('keydown', (event) => {
	if (event.code === 'KeyI' && event.shiftKey) {
		showOpenSourceLicenses();
	}
});

// Load initial data
const loadedMessage: InitialDataRequest = {
	type: 'getInitialData',
};
webviewApi.postMessage(loadedMessage).then((result: WebViewMessageResponse) => {
	if (result?.type === 'initialDataResponse') {
		const revealElements = initializeRevealElements(result.initialData ?? 'no initial data', result.settings);
		document.body.appendChild(revealElements);

		if (result.settings.scrollsOverflow) {
			document.body.classList.add('allowSlidesOverflow');
		}

		void initializeDeck(result.settings, revealElements);
	}
});
