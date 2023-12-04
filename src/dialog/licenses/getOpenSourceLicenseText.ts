
const mitLicense = (copyrightLine: string) => [
	'MIT License',
	'',
	copyrightLine,
	'Permission is hereby granted, free of charge, to any person obtaining a copy ' +
	'of this software and associated documentation files (the "Software"), to deal ' +
	'in the Software without restriction, including without limitation the rights ' +
	'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell ' +
	'copies of the Software, and to permit persons to whom the Software is ' +
	'furnished to do so, subject to the following conditions: '+
	'\n\n' +
	'The above copyright notice and this permission notice shall be included in ' +
	'all copies or substantial portions of the Software. ' +
	'\n\n' +
	'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR ' +
	'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, ' +
	'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE ' +
	'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER ' +
	'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, ' +
	'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN ' +
	'THE SOFTWARE.'
].join('\n');

const getOpenSourceLicenseText = () => {
	const licenseText = [
		'Joplin Plugin RevealJS Integration -- OpenSource Licenses',
		'',
		'This plugin is licensed under the MIT license. Internally, it uses reveal.js to render slideshows.',
		'',
		'NOTE: This plugin is not affiliated with Reveal.js.',
		'',
		'== Reveal.js license (MIT license) ==',
		'',
		mitLicense('Copyright (C) 2011-2023 Hakim El Hattab, http://hakim.se, and reveal.js contributors'),
		'',
		'',
		'== This plugin\'s license (MIT license) ==',
		'',
		mitLicense('Copyright ⓒ 2022-2023 Henry Heino'),
		'',
	].join('\n');

	return licenseText;
};

export default getOpenSourceLicenseText;
