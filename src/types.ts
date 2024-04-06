

export enum PresentationTheme {
	MatchJoplin = 'match-joplin',
	Dark = 'dark',
	Light = 'light',
	BlackOnWhite = 'black-on-white',
	DarkBlue = 'dark-blue',
	LightBlue = 'light-blue',
}

export interface PresentationSettings {
	scrollsOverflow: boolean;
	showSpeakerNotes: boolean;
	theme: PresentationTheme;
	printView: boolean;
}

export interface ShowCloseButtonRequest {
	type: 'showCloseBtn',
}

export interface HideCloseButtonRequest {
	type: 'hideCloseBtn',
}

export interface ToggleCloseButtonRequest {
	type: 'toggleCloseBtn',
}

export interface InitialDataRequest {
	type: 'getInitialData',
}

export interface PrintRequest {
	type: 'print',
}

export interface OpenLinkRequest {
	type: 'openLink',
	href: string,
}

export type WebViewMessage =
	ShowCloseButtonRequest | HideCloseButtonRequest | ToggleCloseButtonRequest | InitialDataRequest | OpenLinkRequest | PrintRequest;

export interface InitialDataResponse {
	type: 'initialDataResponse';

	settings: PresentationSettings;
	initialData: string|undefined;
}

export type WebViewMessageResponse =
	InitialDataResponse | null;
