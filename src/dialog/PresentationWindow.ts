import { DialogResult } from 'api/types';
import { PresentationSettings, WebViewMessage } from '../types';
import AbstractPresentationView, { ButtonRecord, OnMessageHandler } from './AbstractPresentationView';
import { posix as posixPath, resolve } from 'path';
import joplin from 'api';

export default class PresentationWindow extends AbstractPresentationView {
	private scriptPaths: string[] = [];
	private win: Window | undefined = undefined;
	private eventListener: any;
	private onCloseListener = (_result: DialogResult) => {};

	public constructor() {
		super();
	}

	private async getBaseURL() {
		const installationDir = await joplin.plugins.installationDir();
		return `file://${posixPath.normalize(installationDir)}/dialog/window/index.html`;
	}

	private messageOrigin: string | undefined = undefined;
	private async getMessageOrigin() {
		this.messageOrigin ??= new URL(await this.getBaseURL()).origin;
		return this.messageOrigin;
	}

	protected override async addScript(path: string) {
		const scriptPath = resolve(await joplin.plugins.installationDir(), path);
		this.scriptPaths.push(scriptPath);
		this.win?.postMessage({ kind: 'addScript', src: scriptPath }, await this.getMessageOrigin());
	}

	protected override async setDialogButtons(buttons: ButtonRecord[]) {
		this.win?.postMessage({ kind: 'setButtons', buttons }, await this.getMessageOrigin());
	}

	protected override async postMessage(message: WebViewMessage) {
		if (this.win) {
			this.win.postMessage({ message }, await this.getMessageOrigin());
		}
	}

	protected override onMessage(
		onMessageHandler: OnMessageHandler,
	): void {
		if (!this.win) {
			this.eventListener = onMessageHandler;
		} else {
			this.win?.addEventListener('message', async (event) => {
				if (event.origin !== (await this.getMessageOrigin())) {
					return;
				}

				const id = event.data.id;
				if (id) {
					const response = await onMessageHandler(event.data.message);
					this.win?.postMessage({ responseId: id, response });
				} else if (event.data.kind === 'dialogResult') {
					this.onCloseListener(event.data.result);
				}
			});
		}
	}

	protected override async showDialog(): Promise<DialogResult> {
		const installationDir = await joplin.plugins.installationDir();
		const dialog = window.open(
			`file://${posixPath.normalize(installationDir)}/dialog/window/index.html`,
			'_blank',
			'autoHideMenuBar=true',
		)!;
		this.win = dialog;

		await new Promise<void>((resolve) => {
			dialog.addEventListener('load', () => resolve());
		});

		if (this.eventListener) {
			this.onMessage(this.eventListener);
		}

		await super.initializeDialog();

		return new Promise((resolve) => {
			this.onCloseListener = (result) => resolve(result);
		});
	}

	protected override async setFullscreen(_fullscreen: boolean): Promise<void> {
		// Do nothing
	}
	
	protected override async showNewDialogWithSettings(markup: string, settings: PresentationSettings, noteId: string|undefined): Promise<void> {
		const dialog = new PresentationWindow();
		dialog.setSettings(settings);
		return dialog.present(markup, noteId);
	}
}
