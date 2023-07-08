import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { pluginPrefix } from '../constants';
import localization from '../localization';
import { WebViewMessage, WebViewMessageResponse } from '../types';

const dialogs = joplin.views.dialogs;
export type SaveOptionType = 'saveAsCopy' | 'overwrite';

export default class PresentationDialog {
	private static instance: PresentationDialog;
	private handle: string;
	private canFullscreen: boolean = true;
	private isFullscreen: boolean = false;

	/** @returns a reference to the singleton instance of the dialog. */
	public static async getInstance(): Promise<PresentationDialog> {
		if (!PresentationDialog.instance) {
			PresentationDialog.instance = new PresentationDialog();

			PresentationDialog.instance.handle = await dialogs.create(`${pluginPrefix}revealJSDialog`);
			await PresentationDialog.instance.initializeDialog();
		}

		return PresentationDialog.instance;
	}

	private constructor() {
		// Constructor should not be called directly.
		// Use .getInstance.
	}

	/** Resets the dialog prior to use. This can be called multiple times. */
	private async initializeDialog() {
		// Sometimes, the dialog doesn't load properly.
		// Add a cancel button to hide it and try loading again.
		await dialogs.setButtons(this.handle, [{ id: 'cancel' }]);
		await dialogs.setHtml(this.handle, '');

		// Script path is from the root of the plugin directory
		await dialogs.addScript(this.handle, './dialog/webview.js');
		await dialogs.addScript(this.handle, './dialog/webview.css');

		await dialogs.setFitToContent(this.handle, false);
		await this.setFullscreen(false);
	}

	/**
	 * Sets whether this dialog is automatically set to fullscreen mode when the
	 * editor is visible.
	 */
	public async setCanFullscreen(canFullscreen: boolean) {
		this.canFullscreen = canFullscreen;

		if (!canFullscreen) {
			this.setFullscreen(false);
		}
	}

	/** Set whether this drawing dialog takes up the entire Joplin window. */
	private async setFullscreen(fullscreen: boolean) {
		if (this.isFullscreen === fullscreen) {
			return;
		}

		if (!this.canFullscreen && fullscreen) {
			return;
		}

		this.isFullscreen = fullscreen;

		const installationDir = await joplin.plugins.installationDir();

		const cssFile = fullscreen ? 'dialogFullscreen.css' : 'dialogNonfullscreen.css';
		await joplin.window.loadChromeCssFile(installationDir + '/dialog/userchromeStyles/' + cssFile);
	}

	/**
	 * Sets the buttons visible at the bottom of the dialog and toggles fullscreen if necessary (to ensure the buttons)
	 * are visible.
	 */
	private async setDialogButtons(buttons: ButtonSpec[]) {
		// No buttons? Allow fullscreen.
		await this.setFullscreen(buttons.length === 0);
		await dialogs.setButtons(this.handle, buttons);
	}

	public async present(markdownData: string): Promise<void> {
		await this.initializeDialog();

		const result = new Promise<void>((resolve, _reject) => {
			joplin.views.panels.onMessage(this.handle, (message: WebViewMessage): WebViewMessageResponse => {
				if (message.type === 'getInitialData') {
					// The drawing dialog has loaded -- we don't need the exit button.
					this.setDialogButtons([]);

					return {
						type: 'initialDataResponse',

						initialData: markdownData,
					};
				} else if (message.type === 'showCloseBtn') {
					this.setDialogButtons([{
						id: 'cancel',
						title: localization.exit,
					}]);
				} else if (message.type === 'hideCloseBtn') {
					this.setDialogButtons([]);
				}

				return null;
			});

			dialogs.open(this.handle).then((_result: DialogResult) => {
				resolve();
			});
		});
		return await result;
	}
}