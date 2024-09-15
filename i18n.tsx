import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import translationEnglish from './resources/i18n/locale_en.json';
import translationChinese from './resources/i18n/locale_zh_CN.json';

const resources = {
    en: { translation: translationEnglish },
    zh_CN: { translation: translationChinese },
};

const locales = RNLocalize.getLocales();

console.log(locales);

let defaultLang = 'en';

if (Array.isArray(locales)) {
    defaultLang = locales[0].languageTag.startsWith('zh-CN') ? 'zh_CN' : 'en';
}

i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3', resources, lng: defaultLang, fallbackLng: 'en', interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18next;
