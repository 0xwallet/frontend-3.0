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

      <!--      <FormItem class="enter-x" name="policy">-->
      <!--        &lt;!&ndash; No logic, you need to deal with it yourself &ndash;&gt;-->
      <!--        <Checkbox v-model:checked="formData.policy" size="small">-->
      <!--          {{ t('sys.login.policy') }}-->
      <!--        </Checkbox>-->
      <!--      </FormItem>-->
      <FormItem class="enter-x">
        <Button
          type="primary"
          class="enter-x"
          size="large"
          block
          @click="handleRegister"
          :loading="loading"
        >
          {{ t('sys.login.enterButton') }}
        </Button>
      </FormItem>
      <ARow class="enter-x">
        <ACol :xs="24" :md="8">
          <Tooltip>
            <template #title>{{t('sys.login.webAuthnTooltip')}}</template>
            <Button block @click="setLoginState(LoginStateEnum.QR_CODE)"> WebAuthn </Button>
          </Tooltip>

        </ACol>
        <ACol :md="8" :xs="24" class="xs:my-2 md:my-0 xs:mx-0 md:mx-2">
          <Tooltip>
            <template #title>{{t('sys.login.nMobileTooltip')}}</template>
            <Button block @click="setLoginState(LoginStateEnum.nMOBILE)"> nMobile </Button>
          </Tooltip>

        </ACol>
        <ACol :md="7" :xs="24">
          <Button block @click="handleBackLogin">
            {{ t('sys.login.signInFormTitle') }}
          </Button>
        </ACol>
      </ARow>

      <!--      <Button size="large" block class="enter-x mt-4" @click="handleBackLogin">-->
      <!--        {{ t('sys.login.backSignIn') }}-->
      <!--      </Button>-->
    </Form>
  </template>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref, computed } from 'vue';

  import LoginFormTitle from './LoginFormTitle.vue';
  import { Form, Input, Button, Checkbox, Row, Col,Tooltip } from 'ant-design-vue';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { CountdownInput } from '/@/components/CountDown';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';
  import { signUp } from '/@/hooks/apollo/gqlUser';
  import { useMutation } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { newWallet } from '/@/hooks/nkn/getNKN';
  import { SendVerifyCode } from '/@/components/NetFile/user';
  const {  notification } = useMessage();

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
      LoginFormTitle,
      [Col.name]: Col,
      [Row.name]: Row,Tooltip
    },
    setup() {
      const { t } = useI18n();
      const { handleBackLogin, getLoginState, setLoginState } = useLoginState();

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
      const { mutate: SignUp } = useMutation(signUp);

      const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);

      async function handleRegister() {
        const data = await validForm();
        if (!data) return;
        // 注册账号
        await SignUp({
          email: data.email,
          password: data.password,
          code: data.sms,
          username: data.email.split('@')[0],
          nknPublicKey: '',
        });
        notification.success({
          message: t('registerSuccess'),
          duration: 3,
        });
        handleBackLogin();
      }
      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);
        return await SendVerifyCode(data);
      }

      return {
        t,
        formRef,
        formData,
        getFormRules,
        handleRegister,
        loading,
        handleBackLogin,
        getShow,
        handleSendCode,
        setLoginState,
        LoginStateEnum,
      };
    },
  });
</script>
