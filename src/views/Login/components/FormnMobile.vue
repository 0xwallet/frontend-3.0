<template>
  <h2
    class="font-bold text-2xl xl:text-3xl enter-x text-center xl:text-left mb-6"
  >
    {{ $t("pageLogin.nMobileSignInFormTitle") }}
  </h2>
  <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
    <a-form-item v-bind="validateInfos.email">
      <a-input
        size="large"
        v-model:value="modelRef.email"
        :placeholder="$t('pageLogin.email')"
      />
    </a-form-item>
    <a-form-item v-bind="validateInfos.captcha">
      <a-row justify="space-between" :gutter="8">
        <a-col :span="16">
          <a-input
            size="large"
            v-model:value="modelRef.captcha"
            :placeholder="$t('pageLogin.nMobileCode')"
          />
        </a-col>
        <a-col :span="8">
          <a-button size="large" @click.prevent="onSendSignInEmailCaptcha">{{
            $t("countdown.normalText")
          }}</a-button>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item>
      <a-button
        block
        size="large"
        type="primary"
        @click.prevent="onnMobileLogin"
        >{{ $t("pageLogin.loginButton") }}</a-button
      >
    </a-form-item>
    <a-form-item>
      <a-button block size="large" @click.prevent="$emit('setKey', 'email')">{{
        $t("pageLogin.back")
      }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { apiSendSignInEmailCaptcha } from "@/apollo/api";
import { useForm } from "@ant-design-vue/use";
import { defineComponent, reactive, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
// TODO nMobile 登录!!
export default defineComponent({
  emits: ["setKey"],
  setup() {
    const loginLoading = ref<boolean>(false);
    const { t } = useI18n();
    const modelRef = reactive({
      email: "",
      captcha: "",
    });
    const rulesRef = reactive({
      email: [
        {
          type: "email",
          required: true,
          message: t("pageLogin.emailPlaceholder"),
        },
      ],
      captcha: [
        {
          required: true,
          message: t("pageLogin.smsPlaceholder"),
        },
      ],
    });
    const { resetFields, validate, validateInfos } = useForm(
      modelRef,
      rulesRef
    );
    const onSendSignInEmailCaptcha = () => {
      validate(["email"])
        .then(async ({ email }) => {
          console.log("email", email);
          const [res, err] = await apiSendSignInEmailCaptcha({ email });
          if (err) {
            return;
          }
          console.log("sendCaptcha-res", res);
        })
        .catch((err) => console.log(err));
    };
    const onnMobileLogin = () =>
      validate()
        .then(() => {
          const params = toRaw(modelRef);
          console.log(params);
        })
        .catch((err) => console.log("error", err));

    return {
      onSendSignInEmailCaptcha,
      onnMobileLogin,
      loginLoading,
      validateInfos,
      resetFields,
      modelRef,
    };
  },
});
</script>

<style scoped></style>
