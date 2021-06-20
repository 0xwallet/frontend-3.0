<template>
  <h2
    class="font-bold text-2xl xl:text-3xl enter-x text-center xl:text-left mb-6"
  >
    {{ $t("pageLogin.signInFormTitle") }}
  </h2>
  <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
    <a-form-item v-bind="validateInfos.email">
      <a-input
        size="large"
        v-model:value="modelRef.email"
        :placeholder="$t('pageLogin.email')"
      />
    </a-form-item>
    <a-form-item v-bind="validateInfos.password">
      <a-input-password
        size="large"
        visibilityToggle
        v-model:value="modelRef.password"
        :placeholder="$t('pageLogin.password')"
      />
    </a-form-item>
    <!-- 记住我 忘记密码 -->
    <a-form-item :wrapper-col="{ span: 24 }">
      <a-row justify="space-between" align="middle">
        <a-checkbox v-model:checked="modelRef.isRememberMe" name="type">{{
          $t("pageLogin.rememberMe")
        }}</a-checkbox>
        <a-button type="link" @click.prevent="$emit('setKey', 'forget')">{{
          $t("pageLogin.forgetPassword")
        }}</a-button>
      </a-row>
    </a-form-item>

    <!-- 登录按钮 -->
    <a-form-item :wrapper-col="{ span: 24 }">
      <a-button
        size="large"
        :loading="loginLoading"
        block
        type="primary"
        @click.prevent="onSubmit"
        >{{ $t("pageLogin.loginButton") }}</a-button
      >
    </a-form-item>
    <!-- 换方式登录按钮区 -->
    <a-form-item :wrapper-col="{ span: 24 }">
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
          <a-tooltip :title="$t('pageLogin.registerTooltip')">
            <a-button block @click.prevent="$emit('setKey', 'signup')">{{
              $t("pageLogin.registerButton")
            }}</a-button>
          </a-tooltip>
        </a-col>
      </a-row>
    </a-form-item>
    <a-divider
      ><span class="text-xs text-gray-500">{{
        $t("pageLogin.otherSignIn")
      }}</span></a-divider
    >
    <!-- TODO 其他登录方式 -->
    <a-form-item :wrapper-col="{ span: 24 }">
      <a-row justify="space-between" type="flex" :gutter="14">
        <a-col flex="1">
          <a-button block disabled>{{
            $t("pageLogin.recoveryInfoButton")
          }}</a-button>
        </a-col>
        <a-col flex="1">
          <a-button block disabled>{{
            $t("pageLogin.walletProviderButton")
          }}</a-button>
        </a-col>
      </a-row>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, toRaw } from "vue";
import { useForm } from "@ant-design-vue/use";
import { notification } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { apiEmailLogin } from "@/apollo/api";

export default defineComponent({
  emits: ["setKey"],
  setup() {
    const router = useRouter();
    const loginLoading = ref(false);
    const { t } = useI18n();
    const modelRef = reactive({
      email: "",
      password: "",
      isRememberMe: false,
    });
    const rulesRef = reactive({
      email: [
        {
          type: "email",
          required: true,
          message: t("pageLogin.emailPlaceholder"),
        },
      ],
      password: [
        {
          required: true,
          message: t("pageLogin.passwordPlaceholder"),
        },
      ],
    });
    const { resetFields, validate, validateInfos } = useForm(
      modelRef,
      rulesRef
    );
    const onSubmit = () => {
      validate()
        .then(async () => {
          const params = toRaw(modelRef);
          console.log(params);
          loginLoading.value = true;
          const [resEmailLogin, err] = await apiEmailLogin(params);
          loginLoading.value = false;
          if (err || !resEmailLogin) {
            // Modal.error(err); // initApollo onError 会报错
            return;
          }
          console.log("apiEmailLogin", resEmailLogin);
          const { token } = resEmailLogin.data.signin;
          const { id, username } = resEmailLogin.data.signin.User;
          notification.success({
            message: t("pageLogin.loginSuccessTitle"),
            description: `${t("pageLogin.loginSuccessDesc")}: ${username}`,
          });
          const { signInFullPath } = useUserStore();
          const [resLoginFull, errLoginFull] = await signInFullPath({
            id,
            token,
            username,
            email: params.email,
          });
          if (errLoginFull) return;
          router.replace("/");
        })
        .catch((err) => {
          console.log("error", err);
        });
    };
    return {
      loginLoading,
      validateInfos,
      resetFields,
      modelRef,
      onSubmit,
    };
  },
});
</script>
