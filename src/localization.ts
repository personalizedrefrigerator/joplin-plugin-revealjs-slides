
interface AppLocalization {
	startSlideshow: string;
	exit: string;
	endOfDeck: string;
	showExitButton: string;
	print: string;
	printPreview: string;
	close: string;

	printPreviewShownMessage: { start: string; actionLink: string; };

	switchViewsToShowNoteViewer: string;
	switchViewsToShowMarkdownViewer: string;
	unableToGetHtml: string;

	settingsPaneDescription: string;
	showSlidesOverflowSetting: string;
	hideToolbarButtonSetting: string;
	showSpeakerNotesSetting: string;
}

const defaultStrings: AppLocalization = {
	startSlideshow: 'Start slideshow',
	exit: 'Exit',
	endOfDeck: 'End of deck',
	showExitButton: 'Show exit button',
	print: 'Print',
	printPreview: 'Print preview',
	close: 'Close',

	printPreviewShownMessage: {
		start: 'A print preview dialog has been opened. It\'s also possible to ',
		actionLink: 'print directly from this page.',
	},

	switchViewsToShowNoteViewer: 'Please open the note viewer for the current note.',
	unableToGetHtml: 'Unable to get the HTML to present.',
	switchViewsToShowMarkdownViewer: [
		'The slides plugin was unable to get the rendered content of the current note. Showing the markdown viewer may help.',
		'Switch views to show the markdown viewer?'
	].join('\n'),

	settingsPaneDescription: 'Settings for RevealJS Integration. ' +
		'If a presentation is ongoing, it may need to be closed and re-opened ' +
		'for these settings to take effect.',
	hideToolbarButtonSetting: 'Hide slideshow button in editor toolbar (requires restart)',
	showSlidesOverflowSetting: 'Allow scrolling large slides',
	showSpeakerNotesSetting: 'Show speaker notes (if any)',
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,
	es: {
		...defaultStrings,
		close: 'Cerrar',
		exit: 'Salir',
		print: 'Imprimir',
	},
};

let localization: AppLocalization|undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
	const localeSep = language.indexOf('-');

	if (localeSep !== -1) {
		languages.push(language.substring(0, localeSep));
	}
}

for (const locale of languages) {
	if (locale in localizations) {
		localization = localizations[locale];
		break;
	}
}

if (!localization) {
	console.log('No supported localization found. Falling back to default.');
	localization = defaultStrings;
}

export default localization!;
