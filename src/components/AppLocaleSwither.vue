<template>
  <a-dropdown placement="bottomRight">
    <i>
      <svg
        viewBox="0 0 24 24"
        focusable="false"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
          class="css-c4d79v"
        ></path>
      </svg>
    </i>
    <template #overlay>
      <a-menu v-model:selectedKeys="localeObj.localeSelectedKeys">
        <a-menu-item v-for="locale in localeObj.availableLocales" :key="locale">
          <a href="javascript:;" @click="localeObj.onMenuItemClick(locale)">{{
            localeObj.localeMap[locale]
          }}</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useLocalStorage, useTitle } from "@vueuse/core";
import { DEFAULT_LANG, PRODUCT_NAME } from "@/const";
import { Locale, useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    function useLocaleMenu() {
      const globalComposer = useI18n();
      const localeSelectedKeys = reactive([globalComposer.locale.value]);
      const onMenuItemClick = (
        // i18nGlobal: ExportedGlobalComposer,
        itemLocale: Locale
      ) => {
        // console.log("i18nGlobal", i18nGlobal);
        globalComposer.locale.value = itemLocale;
        useLocalStorage("locale", DEFAULT_LANG).value = itemLocale;
        localeSelectedKeys.fill(itemLocale);
        // console.log(route);
        const textPath = `common.${route.meta.title}`;
        useTitle(`${globalComposer.t(textPath)} - ${PRODUCT_NAME}`);
      };
      // TODO 美化样式
      const localeMap: { [key: string]: string } = {
        zh_CN: "简体中文",
        en_US: "English",
      };
      // console.log("localeSelectedKeys", localeSelectedKeys);
      // return { localeSelectedKeys, onMenuItemClick, localeMap };
      return {
        localeObj: {
          localeSelectedKeys,
          onMenuItemClick,
          availableLocales: globalComposer.availableLocales,
          localeMap,
        },
      };
    }
    return { ...useLocaleMenu() };
  },
});
</script>
