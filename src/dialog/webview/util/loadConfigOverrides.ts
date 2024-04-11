
// All options can be found at https://revealjs.com/config/

type ConfigNumberOverrides = {
	width?: number;
	height?: number;
	margin?: number;
	minScale?: number;
	maxScale?: number;
	autoAnimateDuration?: number,
	autoSlide?: number;
};

enum TransitionStyle {
	None='none', Fade='fade', Slide='slide', Convex='convex', Concave='concave', Zoom='zoom',
}
enum ControlsLayout {
	Edges = 'edges',
	BottomRight = 'bottom-right',
}
enum TransitionSpeed {
	Default = 'default',
	Fast = 'fast',
	Slow = 'slow',
}
enum NavigationMode {
	Default = 'default',
	Linear = 'linear',
	Grid = 'grid',
}
type ConfigStringOverrides = {
	backgroundTransition?: TransitionStyle;
	transition?: TransitionStyle;
	controlsLayout?: ControlsLayout;
	transitionSpeed?: TransitionSpeed;
	navigationMode?: NavigationMode;
	autoAnimateMatcher?: '*',
};

type ConfigBooleanOverrides = {
	center?: boolean;
	rtl?: boolean;
	hash?: boolean;
	slideNumber?: boolean;
	progress?: boolean;
	loop?: boolean;
	showNotes?: boolean;
	autoAnimate?: boolean;
	autoAnimateUnmatched?: boolean,
	autoSlideStoppable?: boolean;
	shuffle?: boolean;
	mouseWheel?: boolean;
	touch?: boolean;
	controlsTutorial?: boolean;
	fragments?: boolean;
};
type ConfigOverrides = ConfigNumberOverrides|ConfigStringOverrides|ConfigBooleanOverrides;

const loadConfigOverrides = (deckContent: HTMLElement): ConfigOverrides => {
	const selectConfigElement = (name: string) => {
		return deckContent.querySelector(`rjs-config > rjs-${name}`)
	};

	const numberOverrides: ConfigNumberOverrides = {};
	const loadPropertyNumberValue = (
		name: keyof ConfigNumberOverrides,
		elementNameSuffix?: string,
	) => {
		const element = selectConfigElement(elementNameSuffix ?? name);
		if (element) {
			const content = parseFloat(element.textContent?.trim() ?? '');
			if (isFinite(content)) {
				numberOverrides[name] = content;
				element.remove();
			}
		}
	};

	const stringOverrides: ConfigStringOverrides = {};
	const loadPropertyStringValue = (
		name: keyof ConfigStringOverrides,
		elementNameSuffix: string,
		validValues: string[],
	) => {
		const element = selectConfigElement(elementNameSuffix ?? name);
		if (element) {
			const content = element.textContent;
			if (content && validValues.includes(content)) {
				stringOverrides[name] = content as any;
				element.remove();
			}
		}
	};

	const booleanOverrides: ConfigBooleanOverrides = {};
	const loadPropertyBooleanValue = (
		name: keyof ConfigBooleanOverrides,
		elementNameSuffix?: string,
	) => {
		const element = selectConfigElement(elementNameSuffix ?? name);
		if (element) {
			const content = element.textContent?.trim()?.toLowerCase();
			if (content) {
				if (content === 'true') {
					booleanOverrides[name] = true;
				} else if (content === 'false') {
					booleanOverrides[name] = false;
				}
				element.remove();
			}
		}
	};

	loadPropertyNumberValue('width');
	loadPropertyNumberValue('height');
	loadPropertyNumberValue('margin');
	loadPropertyNumberValue('minScale', 'min-scale');
	loadPropertyNumberValue('maxScale', 'max-scale');
	loadPropertyNumberValue('autoAnimateDuration', 'auto-animate-duration');
	loadPropertyNumberValue('autoSlide', 'auto-slide');

	loadPropertyStringValue(
		'backgroundTransition',
		'background-transition',
		Object.values(TransitionStyle),
	);
	loadPropertyStringValue(
		'transition',
		'transition',
		Object.values(TransitionStyle),
	);
	loadPropertyStringValue(
		'controlsLayout',
		'controls-layout',
		Object.values(ControlsLayout),
	);
	loadPropertyStringValue(
		'transitionSpeed',
		'transition-speed',
		Object.values(TransitionSpeed),
	);
	loadPropertyStringValue(
		'navigationMode',
		'navigation-mode',
		Object.values(NavigationMode),
	);
	loadPropertyStringValue(
		'autoAnimateMatcher',
		'auto-animate-matcher',
		// Until we can determine that custom matchers are reasonably secure
		// (given APIs exposed to Joplin plugin dialogs), only allow '*' as a custom
		// matcher.
		['*'],
	);

	loadPropertyBooleanValue('center');
	loadPropertyBooleanValue('rtl');
	loadPropertyBooleanValue('hash');
	loadPropertyBooleanValue('slideNumber', 'slide-number');
	loadPropertyBooleanValue('progress');
	loadPropertyBooleanValue('loop');
	loadPropertyBooleanValue('showNotes', 'show-notes');
	loadPropertyBooleanValue('autoAnimate', 'auto-animate');
	loadPropertyBooleanValue('autoAnimateUnmatched', 'auto-animate-unmatched');
	loadPropertyBooleanValue('autoSlideStoppable', 'auto-slide-stoppable');
	loadPropertyBooleanValue('shuffle');
	loadPropertyBooleanValue('mouseWheel', 'mouse-wheel');
	loadPropertyBooleanValue('touch');
	loadPropertyBooleanValue('controlsTutorial', 'controls-tutorial');
	loadPropertyBooleanValue('fragments');

	return {...numberOverrides, ...stringOverrides, ...booleanOverrides };
};

export default loadConfigOverrides;