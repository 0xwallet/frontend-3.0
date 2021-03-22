<template>
  <template v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
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
        <Button type="primary" size="large" block @click="handleReset" :loading="loading">
          {{ t('common.resetText') }}
        </Button>
        <Button size="large" block class="mt-4" @click="handleBackLogin">
          {{ t('sys.login.backSignIn') }}
        </Button>
      </FormItem>
    </Form>
  </template>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, computed, unref } from 'vue';

  import LoginFormTitle from './LoginFormTitle.vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormRules, LoginStateEnum, useFormValid } from './useLogin';

  import { useMutation } from '@vue/apollo-composable';
  import { resetPassword } from '/@/hooks/apollo/gqlUser';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useWallet } from '/@/hooks/nkn/getNKN';
  import { SendVerifyCode } from '/@/components/NetFile/user';
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
      LoginFormTitle,
      StrengthMeter,
    },
    setup() {
      const { t } = useI18n();
      const { handleBackLogin, getLoginState } = useLoginState();
      const { getFormRules } = useFormRules();

      const formRef = ref<any>(null);
      const loading = ref(false);

      const formData = reactive({
        email: '',
        sms: '',
      });

      const { validForm } = useFormValid(formRef);

      const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_PASSWORD);

      const { mutate: ResetPassword, onDone } = useMutation(resetPassword);
      onDone((res) => {
        localStorage.removeItem('walletJson');
      });
      async function handleReset() {
        const data = await validForm();
        if (!data) return;
        await ResetPassword({
          email: data.email,
          code: data.sms,
          newPassword: data.password,
          nknPublicKey: '',
        });
        createMessage.success(t('sys.login.changeSuccess'));
        handleBackLogin();
      }

      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);
        data.type = 'RESET_PASSWORD';
        return await SendVerifyCode(data);
      }

      return {
        t,
        formRef,
        formData,
        getFormRules,
        handleReset,
        loading,
        handleBackLogin,
        getShow,
        handleSendCode,
      };
    },
  });
</script>
