import joplin from "api";
import localization from "./localization";
import { SettingItemType, SettingStorage, ToolbarButtonLocation } from "api/types";
import type PresentationDialog from "./dialog/PresentationDialog";
import { PresentationSettings, PresentationTheme, SlideNumbersMode } from "./types";

const showSlidesOverflowKey = 'show-slides-overflow-y';
const showSpeakerNotesKey = 'show-speaker-notes-on-slides';
const hideToolbarButton = 'hide-toolbar-button';
const toolbarButtonLocationKey = 'toolbar-button-location';
const presentationThemeKey = 'presentation-theme-key';
const showSlideNumbersKey = 'slide-numbers-mode';
const rememberSlideshowPositionKey = 'remember-slideshow-position';

export const getSettings = async (): Promise<PresentationSettings> => {
	return {
		scrollsOverflow: await joplin.settings.value(showSlidesOverflowKey),
		showSpeakerNotes: await joplin.settings.value(showSpeakerNotesKey),
		theme: await joplin.settings.value(presentationThemeKey) || PresentationTheme.MatchJoplin,
		slideNumbers: await joplin.settings.value(showSlideNumbersKey),
		printView: false,
	};
};

export const remembersSlideshowPosition = async (): Promise<boolean> => {
	return await joplin.settings.value(rememberSlideshowPositionKey) || false;
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
		[presentationThemeKey]: {
			public: true,
			section: sectionName,

			label: localization.presentationTheme,
			description: localization.presentationTheme__description,

			type: SettingItemType.String,
			isEnum: true,
			storage: SettingStorage.File,
			value: PresentationTheme.MatchJoplin,
			options: {
				[PresentationTheme.MatchJoplin]: localization.theme__matchJoplin,
				[PresentationTheme.Dark]: localization.theme__dark,
				[PresentationTheme.Light]: localization.theme__light,
				[PresentationTheme.BlackOnWhite]: localization.theme__blackOnWhite,
				[PresentationTheme.GraphPaper]: localization.theme__graphPaper,
				[PresentationTheme.LightBlue]: localization.theme__lightBlue,
				[PresentationTheme.DarkBlue]: localization.theme__darkBlue,
				[PresentationTheme.DarkRed]: localization.theme__darkRed,
				// [PresentationTheme.Serif]: localization.theme__serif,
				// [PresentationTheme.Solarized]: localization.theme__solarized,
			},
		},
		[rememberSlideshowPositionKey]: {
			public: true,
			section: sectionName,
			label: localization.rememberSlideshowPositionSetting,
			description: localization.rememberSlideshowPositionSetting__description,
			type: SettingItemType.Bool,
			storage: SettingStorage.File,
			value: true,
		},
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
		[showSlideNumbersKey]: {
			public: true,
			section: sectionName,

			label: localization.showSlideNumbers,

			type: SettingItemType.String,
			isEnum: true,
			storage: SettingStorage.File,
			value: SlideNumbersMode.None,
			options: {
				[SlideNumbersMode.None]: localization.slideNumbers__none,
				[SlideNumbersMode.Current]: localization.slideNumbers__current,
				[SlideNumbersMode.CurrentAndTotal]: localization.slideNumbers__currentAndTotal,
			},
		},
		[hideToolbarButton]: {
			public: true,
			advanced: true,
			section: sectionName,
			label: localization.hideToolbarButtonSetting,
			type: SettingItemType.Bool,
			value: false,
		},
		[toolbarButtonLocationKey]: {
			public: true,
			advanced: true,
			section: sectionName,
			label: localization.toolbarButtonLocationSetting,
			value: ToolbarButtonLocation.NoteToolbar,
			type: SettingItemType.String,
			isEnum: true,
			options: {
				[ToolbarButtonLocation.EditorToolbar]: localization.toolbarButtonLocationSetting__editor,
				[ToolbarButtonLocation.NoteToolbar]: localization.toolbarButtonLocationSetting__note,
			},
		}
	});

	await joplin.settings.onChange(_event => {
		void applySettings();
	});

	await applySettings();
}