import createPopupDialog from "../util/createPopupDialog";
import getOpenSourceLicenseText from "./getOpenSourceLicenseText";

const showOpenSourceLicenses = () => {
	const licenseTextDisplay = document.createElement('div');
	licenseTextDisplay.classList.add('license');

	licenseTextDisplay.innerText = getOpenSourceLicenseText();

	void createPopupDialog(
		'license-text-dialog',
		'Slides Plugin: OpenSource Licenses',
		licenseTextDisplay,
		{ classNames: ['license-text-dialog'] },
	);
};

export default showOpenSourceLicenses;
