import joplin from "api";
import localization from "./localization";
import { SettingItemType, SettingStorage } from "api/types";
import type PresentationDialog from "./dialog/PresentationDialog";
import { PresentationSettings, PresentationTheme } from "./types";

const showSlidesOverflowKey = 'show-slides-overflow-y';
const showSpeakerNotesKey = 'show-speaker-notes-on-slides';
const hideToolbarButton = 'hide-toolbar-button';
const presentationThemeKey = 'presentation-theme-key';

export const getSettings = async (): Promise<PresentationSettings> => {
	return {
		scrollsOverflow: await joplin.settings.value(showSlidesOverflowKey),
		showSpeakerNotes: await joplin.settings.value(showSpeakerNotesKey),
		theme: await joplin.settings.value(presentationThemeKey) || PresentationTheme.MatchJoplin,
		printView: false,
	};
};

export const registerAndApplySettings = async (presentationDialog: PresentationDialog) => {
	const applySettings = async () => {
		const settings = await getSettings();
		presentationDialog.setSettings(settings);
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
		[presentationThemeKey]: {
			public: true,
			section: sectionName,

			label: localization.presentationTheme,

			type: SettingItemType.String,
			isEnum: true,
			storage: SettingStorage.File,
			value: PresentationTheme.MatchJoplin,
			options: {
				[PresentationTheme.MatchJoplin]: localization.theme__matchJoplin,
				[PresentationTheme.Dark]: localization.theme__dark,
				[PresentationTheme.Light]: localization.theme__light,
				[PresentationTheme.BlackOnWhite]: localization.theme__blackOnWhite,
				[PresentationTheme.DarkBlue]: localization.theme__darkBlue,
				// [PresentationTheme.Serif]: localization.theme__serif,
				// [PresentationTheme.Solarized]: localization.theme__solarized,
			},
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