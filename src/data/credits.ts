/**
 * Photo credits (Wikimedia Commons). Required by the CC BY / CC BY-SA licenses:
 * keep author + license + source visible wherever these photos are used.
 * Photos were resized and color-graded for this site.
 */
export interface PhotoCredit {
  slug: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  source: string;
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  {"slug":"hero-fire","title":"HF2024BabyMetal 4","author":"Selbymay","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","source":"https://commons.wikimedia.org/wiki/File:HF2024BabyMetal_4.jpg"},
  {"slug":"stage-red","title":"BABYMETAL Tons of Rock Oslo 2026 25","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_25.jpg"},
  {"slug":"crowd-red","title":"Babymetal - US Tour 2019 01","author":"Easygoing91","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:Babymetal_-_US_Tour_2019_01.jpg"},
  {"slug":"pyro-stage","title":"BABYMETAL Tons of Rock Oslo 2026 01","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_01.jpg"},
  {"slug":"fans","title":"BABYMETAL Tons of Rock Oslo 2026 07","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_07.jpg"},
  {"slug":"trio-red","title":"HF2024BabyMetal 5","author":"Selbymay","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","source":"https://commons.wikimedia.org/wiki/File:HF2024BabyMetal_5.jpg"},
  {"slug":"live-fist","title":"BABYMETAL Tons of Rock Oslo 2026 23","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_23.jpg"},
  {"slug":"live-spin","title":"BABYMETAL Tons of Rock Oslo 2026 21","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_21.jpg"},
  {"slug":"live-jump","title":"HF2024BabyMetal 2","author":"Selbymay","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","source":"https://commons.wikimedia.org/wiki/File:HF2024BabyMetal_2.jpg"},
  {"slug":"stage-amsterdam","title":"Babymetal Amsterdam 20230503","author":"DragonFury","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:Babymetal_Amsterdam_20230503.jpg"},
  {"slug":"live-arms","title":"BABYMETAL Tons of Rock Oslo 2026 03","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_03.jpg"},
  {"slug":"festival-crowd","title":"BABYMETAL Tons of Rock Oslo 2026 38","author":"Birgit Fostervold","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","source":"https://commons.wikimedia.org/wiki/File:BABYMETAL_Tons_of_Rock_Oslo_2026_38.jpg"},
];
