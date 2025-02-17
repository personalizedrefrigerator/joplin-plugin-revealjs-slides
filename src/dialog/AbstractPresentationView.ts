import { ButtonSpec, DialogResult } from 'api/types';
import localization from '../localization';
import {
	PresentationSettings,
	PresentationTheme,
	SlideNumbersMode,
	WebViewMessage,
	WebViewMessageResponse,
} from '../types';
import joplin from 'api';

export type ButtonRecord = {
	id: string;
	title?: string;
};

type SlideChangeListener = (slideHash: string, noteId: string|undefined) => void;
type GetInitialSlideHashCallback = (noteId: string)=> Promise<string>;
export type OnMessageHandler = (message: WebViewMessage) => Promise<WebViewMessageResponse>;

/**
 * An abstract base class that allows opening the presentation dialog
 * in either a Joplin dialog or a new window.
 */
export default abstract class AbstractPresentationView {
	private visible: boolean = false;
	protected canFullscreen: boolean = true;
	private currentButtons: ButtonSpec[] = [];
	private slideChangeListener: SlideChangeListener|null = null;
	private getInitialSlideHash: GetInitialSlideHashCallback = async ()=>'';

	private presentationSettings: PresentationSettings = {
		scrollsOverflow: true,
		showSpeakerNotes: false,
		theme: PresentationTheme.MatchJoplin,
		slideNumbers: SlideNumbersMode.None,
		printView: false,
	};

	protected abstract showNewDialogWithSettings(markup: string, settings: PresentationSettings, noteId: string|undefined): Promise<void>;
	protected abstract addScript(path: string): Promise<void>;
	protected abstract setDialogButtons(buttons: ButtonRecord[]): Promise<void>;
	protected abstract postMessage(message: WebViewMessage): void;
	protected abstract onMessage(
		onMessageHandler: OnMessageHandler,
	): void;
	protected abstract setFullscreen(fullscreen: boolean): Promise<void>;
	protected abstract showDialog(): Promise<DialogResult>;

	public setSettings(settings: PresentationSettings) {
		this.presentationSettings = {...settings};
	}

	public showExitButton() {
		this.currentButtons = [{
			id: 'cancel',
			title: localization.exit,
		}];
		this.setDialogButtons(this.currentButtons);
	}

	public hideExitButton() {
		this.currentButtons = [];
		this.setDialogButtons([]);
	}

	public toggleExitButton() {
		if (this.currentButtons.length > 0) {
			this.hideExitButton();
		} else {
			this.showExitButton();
		}
	}

	/**
	 * Sets whether this dialog is automatically set to fullscreen mode when the
	 * editor is visible.
	 */
	public setCanFullscreen(canFullscreen: boolean) {
		this.canFullscreen = canFullscreen;

		if (!canFullscreen) {
			this.setFullscreen(false);
		}
	}

	/** Resets the dialog prior to use. This can be called multiple times. */
	protected async initializeDialog() {
		// Sometimes, the dialog doesn't load properly.
		// Add a cancel button to hide it and try loading again.
		await this.setDialogButtons([{ id: 'cancel' }]);

		// Script path is from the root of the plugin directory
		await this.addScript('./dialog/webview/webview.js');
		await this.addScript('./dialog/css/webview.css');

		await this.setFullscreen(false);
	}

	public isVisible() {
		return this.visible;
	}

	public setSlideChangeListener(listener: SlideChangeListener) {
		this.slideChangeListener = listener;
	}

	public setGetSlideHashCallback(callback: GetInitialSlideHashCallback) {
		this.getInitialSlideHash = callback;
	}

	/**
	 * Displays a dialog that allows the user to insert a drawing.
	 *
	 * @returns true if the drawing was saved at least once.
	 */
	public async present(markdownData: string, noteId: string|undefined): Promise<void> {
		this.visible = true;
		await this.initializeDialog();

		const result = new Promise<void>((resolve, _reject) => {
			this.onMessage(async (message: WebViewMessage): Promise<WebViewMessageResponse> => {
				if (message.type === 'getInitialData') {
					// The drawing dialog has loaded -- we don't need the exit button.
					this.setDialogButtons([]);

					return {
						type: 'initialDataResponse',

						settings: this.presentationSettings,
						initialData: markdownData,
						initialSlideHash: noteId ? await this.getInitialSlideHash(noteId) : '',
					};
				} else if (message.type === 'showCloseBtn') {
					this.showExitButton();
				} else if (message.type === 'hideCloseBtn') {
					this.hideExitButton();
				} else if (message.type === 'toggleCloseBtn') {
					this.toggleExitButton();
				} else if (message.type === 'slideChanged') {
					this.slideChangeListener?.(message.slideHash, noteId);
				} else if (message.type === 'openLink') {
					console.log('RevealJS slides: Opening item', message.href);

					// Resource?
					if (message.href.startsWith(':/')) {
						this.showExitButton();
					}
					
					joplin.commands.execute('openItem', message.href);
				} else if (message.type === 'print') {
					console.log('RevealJS slides: Printing...');

					void this.showNewDialogWithSettings(markdownData, {
						...this.presentationSettings,
						printView: true,
					}, noteId);
				}

				return null;
			});

			this.showDialog().then(async (_result: DialogResult) => {
				this.visible = false;
				resolve();
			});
		});
		return await result;
	}
}
