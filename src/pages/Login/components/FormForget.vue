<template>
  <h2
    class="font-bold text-2xl xl:text-3xl enter-x text-center xl:text-left mb-6"
  >
    {{ $t("pageLogin.forgetFormTitle") }}
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
        @click.prevent="onResetClick"
        >{{ $t("common.resetText") }}</a-button
      >
    </a-form-item>
    <a-form-item>
      <a-button size="large" block @click.prevent="$emit('setKey', 'email')">{{
        $t("pageLogin.back")
      }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { apiSendSignUpEmailCaptcha, apiResetPwd } from "@/apollo/api";
import { useDelay } from "@/hooks";
import { useUserStore } from "@/store";
import { useForm } from "@ant-design-vue/use";
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
            type: "RESET_PASSWORD",
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
    const onResetClick = () => {
      validate<typeof modelRef>()
        .then(async ({ email, password, captcha }) => {
          const [res, err] = await apiResetPwd({
            email,
            newPassword: password,
            code: captcha,
            nknPublicKey: "",
          });
          if (err) return;
          notification.success({
            message: t("account.changeSuccess"),
          });
          // 先清除旧的信息
          useUserStore().signOutAndClear();
          useDelay().then(() => emit("setKey", "email"));
        })
        .catch((err) => console.log(err));
    };
    return {
      counterCaptcha,
      onSendSignUpEmailCaptcha,
      onResetClick,
      isDisabledCaptcha,
      loginLoading,
      validateInfos,
      resetFields,
      modelRef,
    };
  },
});
</script>