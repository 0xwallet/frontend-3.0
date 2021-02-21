<template>
  <Form class="p-4" :model="formData" :rules="getFormRules" ref="formRef">
    <FormItem name="email" class="enter-x">
      <Input size="large" v-model:value="formData.email" :placeholder="t('sys.login.email')" />
    </FormItem>
    <FormItem name="sms" class="enter-x">
      <CountdownInput
        size="large"
        v-model:value="formData.sms"
        :placeholder="t('sys.login.verification')"
        :sendCodeApi="handleSendCode"
      />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <StrengthMeter
        size="large"
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>
    <FormItem name="confirmPassword" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.confirmPassword"
        :placeholder="t('sys.login.confirmPassword')"
      />
    </FormItem>

    <FormItem class="enter-x">
      <Button
        type="primary"
        size="large"
        block
        @click="handleReset"
        :loading="loading"
        class="enter-x"
      >
        {{ t('common.resetText') }}
      </Button>
      <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
        {{ t('sys.login.backSignIn') }}
      </Button>
    </FormItem>
  </Form>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref } from 'vue';

  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useMutation } from '@vue/apollo-composable';
  import { resetPassword, sendVerifyCode } from '/@/hooks/apollo/gqlUser';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { newWallet, saveWallet } from '/@/hooks/nkn/getNKN';
  const { createErrorModal, createMessage, notification } = useMessage();
  export default defineComponent({
    name: 'ForgetPasswordForm',
    components: {
      Button,
      Form,
      FormItem: Form.Item,
      Input,
      InputPassword: Input.Password,
      CountdownInput,
      StrengthMeter,
    },
    setup() {
      const { t } = useI18n();
      const { setLoginState } = useLoginState();
      const { getFormRules } = useFormRules();

      const formRef = ref<any>(null);
      const loading = ref(false);

      const formData = reactive({
        account: '',
        mobile: '',
        sms: '',
      });

      const { validForm } = useFormValid(formRef);
      const { mutate: ResetPassword, onDone } = useMutation(resetPassword);
      onDone((res) => {
        localStorage.setItem('token', res.data?.resetPassword?.token || '');
      });
      async function handleReset() {
        const data = await validForm();
        if (!data) return;
        const wallet = await newWallet({ email: data.email, password: data.password });
        await ResetPassword({
          email: data.email,
          code: data.sms,
          encryptedWallet: wallet.json,
          newPassword: data.password,
          nknPublicKey: wallet.publicKey,
        });
        saveWallet({ email: data.email, password: data.password, walletJson: wallet.json });
        createMessage.success(t('sys.login.changeSuccess'));
        handleBackLogin();
      }

      function handleBackLogin() {
        setLoginState(LoginStateEnum.LOGIN);
      }
      const { mutate: sendCode } = useMutation(sendVerifyCode);
      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);

        if (!data) return;
        await sendCode({ email: data.email, type: 'RESET_PASSWORD' });
        createMessage.success(t('sys.login.verificationSend'));
        return true;
      }

      return {
        t,
        formRef,
        formData,
        getFormRules,
        handleReset,
        loading,
        handleBackLogin,
        handleSendCode,
      };
    },
  });
</script>
