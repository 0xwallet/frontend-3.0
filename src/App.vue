<template>
  <a-config-provider :locale="locale">
    <!-- 增加开发环境的路由组件显示 -->
    <div
      v-if="isEnvDevelopment"
      class="
        fixed
        top-0
        inset-x-0
        m-auto
        px-10
        w-max
        opacity-70
        bg-gray-700
        text-white
        z-999
      "
    >
      <div>当前路由: {{ curRouteObj.path }}</div>
      <div>路由组件: {{ curRouteObj.component }}</div>
    </div>
    <router-view />
  </a-config-provider>
</template>

<script lang="ts">
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import en_US from "ant-design-vue/es/locale/en_US";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useUserStore } from "./store";
import { notification } from "ant-design-vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  // TODO 全局更改语言配置
  setup() {
    const { t } = useI18n();
    async function trySignInWithLocalStorageAndRedirect() {
      const { signInWithLocalStorage } = useUserStore();
      const [res, err] = await signInWithLocalStorage();
      if (err) {
        console.log("[从本地存储中登录失败] : ", err);
        return;
      }
      notification.success({
        message: t("pageLogin.loginSuccessTitle"),
        description: `${t("pageLogin.loginSuccessDesc")}: ${res?.username}`,
      });
      console.log("[从本地存储中登录成功] : ", res);
    }
    trySignInWithLocalStorageAndRedirect();
    /** 获取本地储存的语言配置 */
    function useStorageLocaleToConfigProvider() {
      const storegeLocale = useLocalStorage("locale", "zh_CN");
      type Lang = typeof zh_CN | typeof en_US;
      const localeMap: {
        [key: string]: Lang;
      } = {
        zh_CN: zh_CN,
        en_US: en_US,
      };
      const refLocale = ref<Lang>(zh_CN);
      watch(
        () => storegeLocale.value,
        (val) => {
          // console.log("watch-val", val);
          refLocale.value = localeMap[val];
        },
        {
          immediate: true,
        }
      );
      return { locale: refLocale };
    }
    /** 判断是否开发环境 */
    function useCurrentEnvironment() {
      const isEnvDevelopment = process.env.NODE_ENV === "development";
      if (!isEnvDevelopment) return { isEnvDevelopment };
      const route = useRoute();
      const curRouteObj = computed(() => {
        const matchedArr = [...route.matched];
        const mapPathComponent = Object.create(null);
        const firstMathed = matchedArr.filter((i) => !i.redirect)[0];
        mapPathComponent.path = firstMathed?.path ?? "";
        mapPathComponent.component =
          (firstMathed?.components.default as any)["__file"] ?? "";
        return mapPathComponent;
      });
      // console.log("curRouteObj", curRouteObj);
      return { isEnvDevelopment, curRouteObj };
    }

    return {
      ...useStorageLocaleToConfigProvider(),
      ...useCurrentEnvironment(),
    };
  },
});
</script>

<style lang="less">
html,
body,
#app {
  width: 100%;
  height: 100%;
}
/* 不加 scope 属性,密码强度栏的默认配色 */
.po-password-strength-bar {
  background-color: rgba(0, 0, 0, 0.25);
}
.ant-color-blue {
  color: #1890ff;
}

// tailwindcss 中用了vertical-align : middle 导致antd 库的很多图标文字不能居中
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  vertical-align: baseline !important;
  // vertical-align: baseline !important;
}
</style>
