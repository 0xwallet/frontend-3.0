import type { WritableComputedRef } from 'vue';
import type { ComposerOptions } from 'vue-i18n';
import { useI18n as useI18nFunc } from 'vue-i18n';
import { setI18nLanguage } from '@/i18n';

export function useI18n(): [WritableComputedRef<string>, Function] {
  const { locale } = useI18nFunc<ComposerOptions>();
  function setLanguage (locale: string) {
    setI18nLanguage(locale);
  }
  return [
    locale,
    setLanguage
  ];
}