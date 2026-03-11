import type { Locale } from './i18n-config';

// We enumerate all dictionaries here for better linting and typescript support
// We also use the 'rest' key to match the structure of the dictionaries
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ar: () => import('./dictionaries/ar.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
