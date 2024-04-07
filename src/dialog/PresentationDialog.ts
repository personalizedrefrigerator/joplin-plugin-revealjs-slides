import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { pluginPrefix } from '../constants';
import isMobile from '../util/isMobile';
import AbstractWebView, { OnMessageHandler } from './AbstractWebView';
import { PresentationSettings, WebViewMessage } from '../types';
import PresentationWindow from './PresentationWindow';

const dialogs = joplin.views.dialogs;
export type SaveOptionType = 'saveAsCopy' | 'overwrite';

export default class PresentationDialog extends AbstractWebView {
	private static instance: PresentationDialog;
	private handle: string;
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
		super();
	}

	/** Resets the dialog prior to use. This can be called multiple times. */
	protected override async initializeDialog() {
		super.initializeDialog();
		await dialogs.setFitToContent(this.handle, false);
	}

	/** Set whether this drawing dialog takes up the entire Joplin window. */
	protected async setFullscreen(fullscreen: boolean) {
		if (this.isFullscreen === fullscreen) {
			return;
		}

		if (!this.canFullscreen && fullscreen) {
			return;
		}

		this.isFullscreen = fullscreen;

		// Global CSS not supported on mobile.
		if (await isMobile()) {
			return;
		}

		const installationDir = await joplin.plugins.installationDir();

		const cssFile = fullscreen ? 'dialogFullscreen.css' : 'dialogNonfullscreen.css';
		await joplin.window.loadChromeCssFile(installationDir + '/dialog/userchromeStyles/' + cssFile);
	}

	/**
	 * Sets the buttons visible at the bottom of the dialog and toggles fullscreen if necessary (to ensure the buttons)
	 * are visible.
	 */
	protected override async setDialogButtons(buttons: ButtonSpec[]) {
		// No buttons? Allow fullscreen.
		await dialogs.setButtons(this.handle, buttons);
		await this.setFullscreen(buttons.length === 0);
	}

	protected override addScript(path: string): Promise<void> {
		return dialogs.addScript(this.handle, path);
	}

	protected override postMessage(message: WebViewMessage) {
		joplin.views.panels.postMessage(this.handle, message);
	}

	protected override onMessage(onMessageHandler: OnMessageHandler): void {
		joplin.views.panels.onMessage(this.handle, onMessageHandler);
	}

	protected override showDialog(): Promise<DialogResult> {
		return dialogs.open(this.handle);
	}
	
	protected override async showNewDialogWithSettings(markup: string, settings: PresentationSettings, noteId: string|undefined): Promise<void> {
		const dialog = new PresentationWindow();
		dialog.setSettings(settings);
		return dialog.present(markup, noteId);
	}
}
