import joplin from "api";
import localization from "./localization";
import { SettingItemType } from "api/types";
import type PresentationDialog from "./dialog/PresentationDialog";
import { PresentationSettings } from "./types";

const showSlidesOverflowKey = 'show-slides-overflow-y';
const showSpeakerNotesKey = 'show-speaker-notes-on-slides';
const hideToolbarButton = 'hide-toolbar-button';

export const getSettings = async (): Promise<PresentationSettings> => {
	return {
		scrollsOverflow: await joplin.settings.value(showSlidesOverflowKey),
		showSpeakerNotes: await joplin.settings.value(showSpeakerNotesKey),
		printView: false,
	};
};

export const registerAndApplySettings = async (presentationDialog: PresentationDialog) => {
	const applySettings = async () => {
		const settings = await getSettings();
		presentationDialog.setScrollsOverflow(settings.scrollsOverflow);
		presentationDialog.setShowSpeakerNotes(settings.showSpeakerNotes)
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