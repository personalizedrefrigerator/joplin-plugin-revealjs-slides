
interface AppLocalization {
	startSlideshow: string;
	exit: string;
	endOfDeck: string;
	showExitButton: string;
	print: string;
}

const defaultStrings: AppLocalization = {
	startSlideshow: 'Start slideshow',
	exit: 'Exit',
	endOfDeck: 'End of deck',
	showExitButton: 'Show exit button',
	print: 'Print',
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,
	es: {
		...defaultStrings,
		exit: 'Cerrar',
		print: 'Imprimir',
	}
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
