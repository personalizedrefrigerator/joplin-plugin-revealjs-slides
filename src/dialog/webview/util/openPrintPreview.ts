import localization from "../../../localization";
import createPopupDialog from "./createPopupDialog";

const openPrintPreview = async () => {
	const descriptionElement = document.createElement('div');
	descriptionElement.appendChild(
		document.createTextNode(localization.printPreviewShownMessage.start)
	);

	// Allow printing directly from this page -- the print preview dialog may not work on
	// all systems (e.g. mobile).
	const directPrintLink = document.createElement('a');
	directPrintLink.innerText = localization.printPreviewShownMessage.actionLink;
	descriptionElement.appendChild(directPrintLink);
	directPrintLink.href = '#';
	directPrintLink.onclick = (event) => {
		event.preventDefault();
		window.print();
	};

	void createPopupDialog(
		'print-preview-notice',
		'Printing...',
		descriptionElement,
	);
	await webviewApi.postMessage({ type: 'print' });
};

export default openPrintPreview;