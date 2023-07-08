
export interface ShowCloseButtonRequest {
	type: 'showCloseBtn',
}

export interface HideCloseButtonRequest {
	type: 'hideCloseBtn',
}

export interface InitialDataRequest {
	type: 'getInitialData',
}

export type WebViewMessage =
	ShowCloseButtonRequest | HideCloseButtonRequest | InitialDataRequest;


export interface InitialDataResponse {
	type: 'initialDataResponse';

	initialData: string|undefined;
}

export type WebViewMessageResponse =
	InitialDataResponse | null;
