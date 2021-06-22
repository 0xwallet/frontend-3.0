<template>
  <div class="login-left relative w-full h-full px-4">
    <!-- 上面的栏 -->
    <AppLocaleSwither
      class="absolute top-4 right-4 enter-x text-lg text-gray-600"
    />
    <!-- 中间页面 -->
    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full">
        <!-- 左边信息展示区 -->
        <div class="hidden xl:flex xl:flex-col xl:w-6/12 min-h-full mr-4 pl-4">
          <!-- <AppLogo class="-enter-x" /> -->
          <!-- logo -->
          <div class="flex items-center absolute w-3/5 -enter-x top-16 left-20">
            <!-- <img src="~@/assets/images/logo_icon.png" /> -->
            <div v-html="svgStr"></div>
            <div class="text-white text-2xl font-bold pl-2.5">
              {{ PRODUCT_NAME }}
            </div>
          </div>
          <div class="my-auto text-left">
            <img
              class="w-1/2 -mt-16 -enter-x"
              src="~@/assets/svg/login-box-bg.svg"
            />
            <div class="mt-10 font-medium text-white -enter-x">
              <span class="mt-4 text-3xl inline-block">
                {{ $t("pageLogin.signInTitle") }}</span
              >
            </div>
            <div
              class="
                mt-5
                text-md text-white
                font-normal
                dark:text-gray-500
                -enter-x
                w-5/6
              "
            >
              {{ $t("pageLogin.signInDesc") }}
            </div>
          </div>
        </div>
        <!-- 右边表单区 -->
        <div
          class="h-full xl:h-auto flex py-5 xl:py-0 xl:my-0 w-full xl:w-6/12"
        >
          <div
            class="
              my-auto
              mx-auto
              xl:mx-20
              xl:bg-transparent
              px-5
              py-8
              sm:px-8
              xl:p-4
              rounded-md
              shadow-md
              xl:shadow-none
              w-full
              sm:w-3/4
              lg:w-2/4
              xl:w-full
              enter-x
              relative
            "
          >
            <component
              :is="curFormComponent"
              @setKey="setCurrentFormKey"
            ></component>
            <!-- 放置不同的表单 -->
            <!-- <FormEmail
              @setKey="setCurrentFormKey"
              v-if="currentFormKey === 'email'"
            />
            <FormSignup
              @setKey="setCurrentFormKey"
              v-if="currentFormKey === 'signup'"
            /> -->
            <!-- <LoginForm /> -->
            <!-- <ForgetPasswordForm />
            <RegisterForm />
            <nMobileForm />
            <QrCodeForm /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { PRODUCT_NAME } from "@/const";
import { AppLocaleSwither } from "@/components";
import FormEmail from "./components/FormEmail.vue";
import FormSignup from "./components/FormSignup.vue";
import FormForget from "./components/FormForget.vue";
import FormnMobile from "./components/FormnMobile.vue";
import FormWebauthn from "./components/FormWebauthn.vue";
export type ICurrentFormKey =
  | "email"
  | "forget"
  | "signup"
  | "nMobile"
  | "webauthn";

import { useSvgWhiteLogo } from "@/hooks";
export default defineComponent({
  components: {
    AppLocaleSwither,
    FormEmail,
    FormSignup,
    FormForget,
    FormnMobile,
    FormWebauthn,
  },
  setup() {
    // const svgWidth = 50;
    // const svgHeight = 50;
    /** 获取logo 部分的svg和名称 */
    function useLogoSvgAndName() {
      return {
        PRODUCT_NAME,
        svgStr: useSvgWhiteLogo(),
      };
    }
    function useCurrentForm() {
      const currentFormKey = ref<ICurrentFormKey>("email");
      const setCurrentFormKey = (key: ICurrentFormKey) => {
        currentFormKey.value = key;
      };
      // const curFormComponent = ref<string>("FormEmail");
      const mapComponentName: {
        [key in ICurrentFormKey]: string;
      } = {
        email: "FormEmail",
        forget: "FormForget",
        signup: "FormSignup",
        nMobile: "FormnMobile",
        webauthn: "FormWebauthn",
      };
      const curFormComponent = computed(() => {
        return mapComponentName[currentFormKey.value];
      });
      return {
        // currentFormKey,
        setCurrentFormKey,
        curFormComponent,
      };
    }
    return {
      ...useLogoSvgAndName(),
      ...useCurrentForm(),
    };
  },
});
</script>

<style lang="less" scoped>
.login-left::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-left: -48%;
  background-image: url("~@/assets/svg/login-bg.svg");
  background-position: 100%;
  background-repeat: no-repeat;
  background-size: auto 100%;
}
</style>
