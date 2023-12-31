import localization from "../../localization";
import getOpenSourceLicenseText from "./getOpenSourceLicenseText";

let visibleDialog: HTMLDialogElement|null = null;
const showOpenSourceLicenses = () => {
	const dialog = document.createElement('dialog');
	dialog.classList.add('license-text-dialog');

	if (visibleDialog && visibleDialog.parentElement) {
		visibleDialog.close();
		visibleDialog = null;
	}
	visibleDialog = dialog;

	const header = document.createElement('h2');
	header.innerText = 'Slides Plugin: OpenSource Licenses';

	const licenseTextDisplay = document.createElement('div');
	licenseTextDisplay.classList.add('license');

	licenseTextDisplay.innerText = getOpenSourceLicenseText();

	const closeButton = document.createElement('button');
	closeButton.innerText = localization.close;
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

	dialog.addEventListener('close', () => {
		dialog.remove();

		if (visibleDialog === dialog) {
			visibleDialog = null;
		}
	});

	dialog.replaceChildren(header, licenseTextDisplay, closeButton);
	document.body.appendChild(dialog);
	dialog.showModal();
};

export default showOpenSourceLicenses;
