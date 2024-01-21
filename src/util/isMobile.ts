import joplin from "api";

const isMobile = async () => {
	const version = await joplin.versionInfo?.() as any;
	return version?.platform === 'mobile';
};

export default isMobile;