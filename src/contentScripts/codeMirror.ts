import CodeMirror = require("codemirror");

export default (_context: { contentScriptId: string }) => {
	return {
		plugin: (codeMirror: typeof CodeMirror, _options: any) => {
			codeMirror.defineExtension('revealJSIntegration--isCodeMirrorActive', () => {
				return 'active';
			});

			// Selects `target`, moves the cursor to that selection, and deletes the selected
			// text.
			// This is useful for inserting text in one editor mode, then deleting that text
			// to sync the cursor position.
			// TODO: Currently unused.
			codeMirror.defineExtension('revealJSIntegration--cmSelectAndDelete', function(target: string) {
				const searchCursor = this.getSearchCursor(target, 0, {
					multiline: 'disable'
				});
				const foundNext = searchCursor.findNext();
				const targetCursorLoc = searchCursor.from();

				if (!foundNext) {
					return false;
				}

				searchCursor.replace('');

				const selectionRanges = [ { anchor: targetCursorLoc, head: targetCursorLoc } ];
				this.setSelections(selectionRanges, 0);

				return foundNext;
			});
		},
		codeMirrorResources: ['addon/search/searchcursor.js'],
	}
};
