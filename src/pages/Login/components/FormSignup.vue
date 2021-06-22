<template>
  <h2
    class="font-bold text-2xl xl:text-3xl enter-x text-center xl:text-left mb-6"
  >
    {{ $t("pageLogin.signUpFormTitle") }}
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
        <a-col :span="14">
          <a-input
            size="large"
            v-model:value="modelRef.captcha"
            :placeholder="$t('pageLogin.verification')"
          />
        </a-col>
        <a-col :span="10">
          <a-button
            block
            size="large"
            :disabled="isDisabledCaptcha"
            @click.prevent="onSendSignUpEmailCaptcha"
            >{{
              !isDisabledCaptcha
                ? $t("countdown.normalText")
                : $t("countdown.sendText", [counterCaptcha])
            }}</a-button
          >
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item v-bind="validateInfos.password">
      <a-input-password
        size="large"
        visibilityToggle
        v-model:value="modelRef.password"
        :placeholder="$t('pageLogin.password')"
      />
      <password-meter :password="modelRef.password" />
    </a-form-item>
    <a-form-item v-bind="validateInfos.confirmPassword">
      <a-input-password
        size="large"
        visibilityToggle
        v-model:value="modelRef.confirmPassword"
        :placeholder="$t('pageLogin.confirmPassword')"
      />
    </a-form-item>
    <a-form-item>
      <a-button
        block
        size="large"
        type="primary"
        @click.prevent="onSignUpClick"
        >{{ $t("pageLogin.enterButton") }}</a-button
      >
    </a-form-item>
    <a-form-item>
      <a-row justify="space-between" type="flex" :gutter="14">
        <a-col flex="1">
          <a-tooltip :title="$t('pageLogin.webAuthnTooltip')">
            <a-button block @click.prevent="$emit('setKey', 'webauthn')"
              >WebAuthn</a-button
            >
          </a-tooltip>
        </a-col>
        <a-col flex="1">
          <a-tooltip :title="$t('pageLogin.nMobileTooltip')">
            <a-button block @click.prevent="$emit('setKey', 'nMobile')"
              >nMobile</a-button
            >
          </a-tooltip>
        </a-col>
        <a-col flex="1">
          <a-button block @click.prevent="$emit('setKey', 'email')">{{
            $t("pageLogin.back")
          }}</a-button>
        </a-col>
      </a-row>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { apiSendSignUpEmailCaptcha, apiSignUp } from "@/apollo/api";
import { useDelay } from "@/hooks";
import { useForm } from "@ant-design-vue/use";
import { useIntervalFn } from "@vueuse/core";
import { message, notification } from "ant-design-vue";
import { RuleObject } from "ant-design-vue/lib/form/interface";
import { defineComponent, onBeforeUnmount, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import PasswordMeter from "vue-simple-password-meter";

export default defineComponent({
  emits: ["setKey"],
  components: {
    PasswordMeter,
  },
  setup(props, { emit }) {
    const loginLoading = ref<boolean>(false);
    const { t } = useI18n();
    const modelRef = reactive({
      email: "",
      captcha: "",
      password: "",
      confirmPassword: "",
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
      password: [
        {
          required: true,
          message: t("pageLogin.passwordPlaceholder"),
        },
      ],
      confirmPassword: [
        {
          required: true,
          trigger: "change",
          asyncValidator: (rule: RuleObject, val: string) => {
            return new Promise<void>((resolve, reject) => {
              val && val === modelRef.password
                ? resolve()
                : reject(t("pageLogin.diffPwd"));
            });
          },
        },
      ],
    });
    const { resetFields, validate, validateInfos } = useForm(
      modelRef,
      rulesRef
    );
    const isDisabledCaptcha = ref(false);
    const counterCaptcha = ref(60);
    let id: number;
    const countDown = {
      startWithAutoStop() {
        if (id) clearInterval(id);
        counterCaptcha.value = 60;
        isDisabledCaptcha.value = true;
        id = window.setInterval(() => {
          if (counterCaptcha.value === 1) {
            clearInterval(id);
            isDisabledCaptcha.value = false;
          }
          counterCaptcha.value--;
        }, 1000);
      },
      stop() {
        clearInterval(id);
        isDisabledCaptcha.value = false;
      },
    };
    // 防止内存泄漏
    onBeforeUnmount(() => id && countDown.stop());
    /** 校验邮箱然后发送验证码 */
    const onSendSignUpEmailCaptcha = () => {
      validate(["email"])
        .then(async ({ email }) => {
          const [res, err] = await apiSendSignUpEmailCaptcha({
            email,
            type: "ACTIVE_EMAIL",
          });
          if (err) return;
          // 验证码发送成功 提示语 按钮60秒禁用 ?
          message.success(t("pageLogin.verificationSend"));
          // 禁用发送验证码按钮和计数
          countDown.startWithAutoStop();
          console.log("res", res);
        })
        .catch((err) => console.log(err));
    };
    /** 创建用户按钮点击 */
    const onSignUpClick = () => {
      validate<typeof modelRef>()
        .then(async ({ email, password, captcha }) => {
          const [res, err] = await apiSignUp({
            email,
            password,
            code: captcha,
            username: email.split("@")[0],
            nknPublicKey: "",
          });
          if (err) return;
          notification.success({
            message: t("pageLogin.registerSuccess"),
          });
          useDelay().then(() => emit("setKey", "email"));
        })
        .catch((err) => console.log(err));
    };
    return {
      counterCaptcha,
      onSendSignUpEmailCaptcha,
      onSignUpClick,
      isDisabledCaptcha,
      loginLoading,
      validateInfos,
      resetFields,
      modelRef,
    };
  },
});
</script>