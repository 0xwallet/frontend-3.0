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

    <!--    <FormItem class="enter-x" name="policy">-->
    <!--      &lt;!&ndash; No logic, you need to deal with it yourself &ndash;&gt;-->
    <!--      <Checkbox v-model:checked="formData.policy" size="small">-->
    <!--        {{ t('sys.login.policy') }}-->
    <!--      </Checkbox>-->
    <!--    </FormItem>-->

    <Button
      type="primary"
      size="large"
      block
      @click="handleRegister"
      :loading="loading"
      class="enter-x"
    >
      {{ t('sys.login.registerButton') }}
    </Button>
    <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
      {{ t('sys.login.backSignIn') }}
    </Button>
  </Form>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref } from 'vue';

  import { Form, Input, Button, Checkbox } from 'ant-design-vue';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { CountdownInput } from '/@/components/CountDown';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { sendVerifyCode, signUp } from '/@/hooks/apollo/gqlUser';
  import { useMutation } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { newWallet, saveWallet } from '/@/hooks/nkn/getNKN';
  const { createErrorModal, createMessage, notification } = useMessage();
  export default defineComponent({
    name: 'RegisterPasswordForm',
    components: {
      Button,
      Form,
      FormItem: Form.Item,
      Input,
      InputPassword: Input.Password,
      Checkbox,
      StrengthMeter,
      CountdownInput,
    },
    setup() {
      const { t } = useI18n();
      const { setLoginState } = useLoginState();

      const formRef = ref<any>(null);
      const loading = ref(false);

      const formData = reactive({
        email: '',
        password: '',
        confirmPassword: '',
        sms: '',
      });

      const { getFormRules } = useFormRules(formData);
      const { validForm } = useFormValid(formRef);
      const { mutate: sendCode } = useMutation(sendVerifyCode);
      const { mutate: SignUp } = useMutation(signUp);
      async function handleRegister() {
        const data = await validForm();
        if (!data) return;
        const wallet = await newWallet({ email: data.mail, password: data.password });
        // 注册账号
        await SignUp({
          email: data.email,
          password: data.password,
          code: data.sms,
          username: data.email.split('@')[0],
          nknEncryptedWallet: wallet.json,
          nknPublicKey: wallet.publicKey,
        });
        saveWallet({ email: data.email, password: data.password, walletJson: wallet.json });
        notification.success({
          message: t('registerSuccess'),
          duration: 3,
        });
        handleBackLogin();
      }

      function handleBackLogin() {
        setLoginState(LoginStateEnum.LOGIN);
      }

      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);

        if (!data) return;
        await sendCode({ email: data.email });
        createMessage.success(t('sys.login.verificationSend'));
        return true;
      }
      return {
        t,
        formRef,
        formData,
        getFormRules,
        handleRegister,
        loading,
        handleBackLogin,
        handleSendCode,
      };
    },
  });
</script>
