import joplin from 'api';
import { ContentScriptType, MenuItemLocation, SettingItemType, ToolbarButtonLocation } from 'api/types';
import localization from './localization';
import PresentationDialog from './dialog/PresentationDialog';
import { pluginPrefix } from './constants';

// Returns true if the CodeMirror editor is active.
const isMarkdownEditor = async () => {
	return await joplin.commands.execute('editor.execCommand', {
		name: 'revealJSIntegration--isCodeMirrorActive',
	}) === 'active';
};


// Based on code in my other plugin: joplin-plugin-freehand-drawing
const registerAndApplySettings = async (presentationDialog: PresentationDialog) => {
	// Joplin adds a prefix to the setting in settings.json for us.
	const showSlidesOverflowKey = 'show-slides-overflow-y';
	const showSpeakerNotesKey = 'show-speaker-notes-on-slides';
	const hideToolbarButton = 'hide-toolbar-button';

	const applySettings = async () => {
		const scrollsOverflow = await joplin.settings.value(showSlidesOverflowKey);
		presentationDialog.setScrollsOverflow(scrollsOverflow);

		const showSpeakerNotes = await joplin.settings.value(showSpeakerNotesKey);
		presentationDialog.setShowSpeakerNotes(showSpeakerNotes)
	};

	const sectionName = 'revealjs-integration';
	await joplin.settings.registerSection(sectionName, {
		label: 'RevealJS Integration',
		iconName: 'fas fa-play',
		description: localization.settingsPaneDescription,
	});

	// Editor fullscreen setting
	await joplin.settings.registerSettings({
		[showSlidesOverflowKey]: {
			public: true,
			section: sectionName,

			label: localization.showSlidesOverflowSetting,

			type: SettingItemType.Bool,
			value: true,
		},
		[showSpeakerNotesKey]: {
			public: true,
			section: sectionName,

			label: localization.showSpeakerNotesSetting,

			type: SettingItemType.Bool,
			value: false,
		},
		[hideToolbarButton]: {
			public: true,
			section: sectionName,
			label: localization.hideToolbarButtonSetting,
			type: SettingItemType.Bool,
			value: false,
		},
	});

	await joplin.settings.onChange(_event => {
		void applySettings();
	});

	await applySettings();
}

joplin.plugins.register({
	onStart: async function() {
		const presentationDialog = await PresentationDialog.getInstance();
		const toolbuttonCommand = `${pluginPrefix}start-slideshow`;

		await registerAndApplySettings(presentationDialog);

		let onNextRender: (()=>void)|null = null;
		const awaitNextRender = (timeout: number) => {
			return new Promise<void>((resolve, _reject) => {
				const prevOnNextRender = onNextRender;

				onNextRender = () => {
					if (prevOnNextRender) {
						prevOnNextRender();
					}

					resolve();
				};

				setTimeout(() => {
					onNextRender = prevOnNextRender;
					resolve();
				}, timeout);
			});
		};

		let renderedContent = '';
		const startSlideshow = async () => {
			const wasMarkdownEditor = await isMarkdownEditor();

			// MCE or Joplin has a bug where inserting markdown code for an SVG image removes
			// the image data. See https://github.com/laurent22/joplin/issues/7547.
			if (!wasMarkdownEditor) {
				// Switch to the markdown editor.
				await Promise.all([
					joplin.commands.execute('toggleEditors'),

					// ...and wait for the content to be re-rendered.
					awaitNextRender(1000),
				]);
			}

			presentationDialog.present(renderedContent);

			// Try to switch back to the original editor
			if (!wasMarkdownEditor) {
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
		await joplin.contentScripts.onMessage(markdownItContentScriptId, async (renderedHTML: string) => {
			renderedContent = renderedHTML;
			onNextRender?.();
			onNextRender = null;
		});
		const codeMirrorContentScriptId = `${pluginPrefix}codeMirrorContentScriptId`;
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			codeMirrorContentScriptId,
			'./contentScripts/codeMirror.js'
		);
	},
});
