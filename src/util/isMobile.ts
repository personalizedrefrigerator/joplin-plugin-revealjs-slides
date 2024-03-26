import joplin from "api";

const isMobile = async () => {
	try {
		const version = await joplin.versionInfo() as any;
		return version?.platform === 'mobile';
	} catch(error) {
		console.warn('Error checking whether the device is a mobile device. Assuming desktop.', error);
		return false;
	}
};

export default isMobile;