import type MarkdownIt = require("markdown-it");

//declare const webviewApi: any;

export default (context: { contentScriptId: string }) => {
	return {
		plugin: (_markdownIt: MarkdownIt, _options: any) => {
			console.log(context.contentScriptId);
		},
		assets: () => [{ name: 'getRenderedMarkdown.js' }],
	}
}