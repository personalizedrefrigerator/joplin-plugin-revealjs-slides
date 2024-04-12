

// Allows using Joplin image resources as backgrounds by referencing them with IDs.
// For example, for calling fixBackgroundUrl on the data-background-image of the below section:
//   <img src=":/joplinimageidhere" id="some-id"/>
//   <section data-background-image="id(some-id)">
//      ...
//   </section>
const fixBackgroundUrl = (slidesContainer: HTMLElement, url: string) => {
	const selectorMatch = url.match(/^(id|title)\((.*)\)$/);
	if (selectorMatch) {
		const field = selectorMatch[1]; // id|title
		const query = selectorMatch[2];

		const target = slidesContainer.querySelector(`*[${field}=${JSON.stringify(query)}]`);
		const newUrl = target?.getAttribute('src');
		if (target && newUrl) {
			target.classList.add('-used-as-background');
			return newUrl;
		}
	}
	return url;
};
export default fixBackgroundUrl;