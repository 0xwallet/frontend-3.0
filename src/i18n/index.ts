import { createI18n, I18n } from 'vue-i18n';
import en from './locales/en';
import zhCN from './locales/zh-CN';

type I18nType = I18n<{ en: {}; 'zh-CN': {} }, unknown, unknown>;

let i18n: I18nType;
export function setI18nLanguage(locale: string) {
  i18n.global.locale.value = locale;
  const elem = document.querySelector('html');
  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  if (elem) {
    elem.setAttribute('lang', locale);
  }
}

export function setupI18n(locale = 'zh-CN') {
  i18n = createI18n({
    locale,
    fallbackLocale: 'zh-CN',
    messages: {
      en,
      'zh-CN': zhCN
    }
  });
  setI18nLanguage(locale);
  return i18n;
}