
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

export interface OpenLinkRequest {
	type: 'openLink',
	href: string,
}

export type WebViewMessage =
	ShowCloseButtonRequest | HideCloseButtonRequest | ToggleCloseButtonRequest | InitialDataRequest | OpenLinkRequest;


export interface InitialDataResponse {
	type: 'initialDataResponse';

	initialData: string|undefined;
}

export type WebViewMessageResponse =
	InitialDataResponse | null;
