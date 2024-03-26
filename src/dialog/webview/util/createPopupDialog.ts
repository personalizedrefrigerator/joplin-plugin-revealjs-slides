import localization from "../../../localization";

interface DialogOptions {
	classNames?: string[];
	closeLabel?: string;
}

const visibleDialogs: Map<string, HTMLDialogElement> = new Map();
const createPopupDialog = (id: string, headerText: string, content: HTMLElement, options?: DialogOptions) => {
	const dialog = document.createElement('dialog');
	dialog.classList.add('popup-dialog', ...(options?.classNames ?? []));

	const previousDialog = visibleDialogs.get(id);
	if (previousDialog?.parentElement) {
		previousDialog.close();
	}
	visibleDialogs.set(id, dialog);

	const header = document.createElement('h2');
	header.innerText = headerText;

	const closeButton = document.createElement('button');
	closeButton.innerText = options?.closeLabel ?? localization.close;
	closeButton.classList.add('close');

	const dismissDialog = () => {
		const animationDuration = 300;
		setTimeout(() => dialog.close(), animationDuration);

		dialog.classList.add('hiding');
		dialog.style.transition = `${animationDuration}ms ease opacity`;
		dialog.style.opacity = '0';
	};

	closeButton.onclick = () => {
		dismissDialog();
	};

	dialog.addEventListener('keydown', event => {
		if (event.code === 'Escape' || event.code === 'Space') {
			dismissDialog();

			// Avoid default action
			event.stopPropagation();
		}
	});
	
	return new Promise<void>(resolve => {
		dialog.addEventListener('close', () => {
			dialog.remove();

			if (visibleDialogs.get(id) === dialog) {
				visibleDialogs.delete(id);
			}

			resolve();
		});

		dialog.replaceChildren(header, content, closeButton);
		document.body.appendChild(dialog);
		dialog.showModal();
	});
};

export default createPopupDialog;
