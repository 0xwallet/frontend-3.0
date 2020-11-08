import { createI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import type { I18nOptions } from 'vue-i18n';
export function useI18n(options?: I18nOptions) {
  const { global } = createI18n(options);

  const localeRef = ref(global.locale);

  watch(localeRef, () => {
    global.locale = localeRef.value as any;
  });
  return {
    t: global.t,
    localeRef,
  };
}