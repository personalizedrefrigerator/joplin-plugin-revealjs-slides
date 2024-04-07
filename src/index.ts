import joplin from 'api';
import { ContentScriptType, MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import localization from './localization';
import PresentationDialog from './dialog/PresentationDialog';
import { pluginPrefix } from './constants';
import isMobile from './util/isMobile';
import registerExportModule from './exporter/registerExportModule';
import { registerAndApplySettings, remembersSlideshowPosition } from './settings';

// Returns true if the CodeMirror editor is active.
const isRichTextEditor = async () => {
	const mobile = await isMobile();
	if (mobile) {
		// No rich text editor on mobile
		return false;
	}
	return await joplin.commands.execute('editor.execCommand', { name: 'revealJSIntegration--isCodeMirrorActive' }) !== 'active';
};

const registerSlideTracker = async (presentationDialog: PresentationDialog) => {
	const ModelTypeNote = 1;
	const slideHashKey = 'rjs-last-slide-hash';

	presentationDialog.setSlideChangeListener(async (slideHash, noteId) => {
		if (!noteId) return;

		if (await remembersSlideshowPosition()) {
			await joplin.data.userDataSet(ModelTypeNote, noteId, slideHashKey, slideHash);
		}
	});
	presentationDialog.setGetSlideHashCallback(async (noteId: string) => {
		if (!(await remembersSlideshowPosition())) {
			return '';
		}
		return await joplin.data.userDataGet(ModelTypeNote, noteId, slideHashKey);
	});
}


joplin.plugins.register({
	onStart: async function() {
		const presentationDialog = await PresentationDialog.getInstance();
		const toolbuttonCommand = `${pluginPrefix}start-slideshow`;

		await registerAndApplySettings(presentationDialog);
		await registerSlideTracker(presentationDialog);

		let onHtmlResponse: (()=>void)|null = null;
		const awaitNextHtmlResponse = (timeout: number) => {
			return new Promise<boolean>((resolve, _reject) => {
				const prevOnNextHtmlResponse = onHtmlResponse;

				onHtmlResponse = () => {
					if (prevOnNextHtmlResponse) {
						prevOnNextHtmlResponse();
					}

					resolve(true);
				};

				setTimeout(() => {
					onHtmlResponse = prevOnNextHtmlResponse;
					resolve(false);
				}, timeout);
			});
		};

		let getHtmlCallbacks: (()=>Promise<void>)[] = [];
		let renderedContent: string = '';
		const getRenderedHtml = async (tryCount: number = 0, timeout: number = 1500): Promise<string> => {
			for (const callback of getHtmlCallbacks) {
				callback();
			}

			const success = await awaitNextHtmlResponse(timeout);

			// If we weren't able to connect to a markdown-it script, there are a few things that could
			// be happening:
			// 1. It's an HTML note.
			// 2. The note viewer is hidden.
			//
			// We try to fix case 2 by showing the note viewer:
			if (!success) {
				if (tryCount >= 1) {
					alert(localization.unableToGetHtml);
					return '';
				}

				if (await isMobile()) {
					// On mobile, we can't auto-switch to the note viewer to start the presentation.
					alert(localization.switchViewsToShowNoteViewer);
					return getRenderedHtml(tryCount + 1, 15000);
				} else {
					const tryToSwitchViews = confirm(localization.switchViewsToShowMarkdownViewer);

					const togglePanes = async () => {
						// May not work on mobile.
						try {
							await joplin.commands.execute('toggleVisiblePanes');
						} catch (error) {
							console.error(error);
						}
					};

					if (tryToSwitchViews) {
						togglePanes();
					}

					return new Promise<string>((resolve) => {
						setTimeout(async () => {
							const result = getRenderedHtml(tryCount + 1);
							// Switch back (requires multiple toggles as there are multiple
							// panes).
							if (tryToSwitchViews) {
								togglePanes();
								togglePanes();
							}
							resolve(result);
						}, 500);
					});
				}
			}
			return renderedContent;
		};

		const startSlideshow = async () => {
			const wasRichTextEditor = await isRichTextEditor();

			// We need to switch to the markdown editor to trigger a re-render
			if (wasRichTextEditor) {
				// Switch to the markdown editor.
				await Promise.all([
					joplin.commands.execute('toggleEditors'),

					// ...and wait for the content to be re-rendered.
					awaitNextHtmlResponse(1000),
				]);
			}

			const selectedNote = await joplin.workspace.selectedNote();
			presentationDialog.present(await getRenderedHtml(), selectedNote?.id);

			// Try to switch back to the original editor
			if (wasRichTextEditor) {
				await joplin.commands.execute('toggleEditors');
			}
		};

		await joplin.commands.register({
			name: toolbuttonCommand,
			label: localization.startSlideshow,
			iconName: 'fas fa-play',
			execute: async () => {
				// If a slideshow is already running,
				if (presentationDialog.isVisible()) {
					// toggle whether the "exit" button is visible.
					presentationDialog.toggleExitButton();
					return;
				}
	
				// Force a re-render by switching to the plain text editor
				startSlideshow();
			},
		});

		if (!(await joplin.settings.value('hide-toolbar-button'))) {
			await joplin.views.toolbarButtons.create(
				toolbuttonCommand, toolbuttonCommand, ToolbarButtonLocation.EditorToolbar,
			);
		}

		// Also add to the View menu so that users can associate a keybinding with it.
		const startPresentationButtonId = `${pluginPrefix}startPresentation`;
		await joplin.views.menuItems.create(startPresentationButtonId, toolbuttonCommand, MenuItemLocation.View);

		const markdownItContentScriptId = `${pluginPrefix}markdownItPlugin`;
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			markdownItContentScriptId,
			'./contentScripts/markdownIt.js',
		);
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (message: any) => {
			if (message.type === 'waitForHtmlRequest') {
				return await new Promise<void>(resolve => {
					if (!onHtmlResponse) {
						getHtmlCallbacks.push(async () => {
							getHtmlCallbacks = [];
							resolve();
						});
					} else {
						resolve();
					}
				});
			} else {
				renderedContent = message.html;
				onHtmlResponse?.();
				onHtmlResponse = null;
			}
		});

		const codeMirrorContentScriptId = `${pluginPrefix}codeMirrorContentScriptId`;
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			codeMirrorContentScriptId,
			'./contentScripts/codeMirror.js'
		);

		await registerExportModule();
	},
});
