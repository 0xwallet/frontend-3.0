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
          :placeholder="t('sys.login.smsCode')"
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
          {{ t('sys.login.registerButton') }}
        </Button>
      </FormItem>
      <ARow class="enter-x">
        <ACol :xs="24" :md="8">
          <Button block @click="setLoginState(LoginStateEnum.QR_CODE)"> WebAuth登录 </Button>
        </ACol>
        <ACol :md="8" :xs="24" class="xs:my-2 md:my-0 xs:mx-0 md:mx-2">
          <Button block @click="setLoginState(LoginStateEnum.MOBILE)"> nMoblie登录 </Button>
        </ACol>
        <ACol :md="7" :xs="24">
          <Button block @click="handleBackLogin">
            {{ t('sys.login.loginButton') }}
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
  import { Form, Input, Button, Checkbox, Row, Col } from 'ant-design-vue';
  import { StrengthMeter } from '/@/components/StrengthMeter';
  import { CountdownInput } from '/@/components/CountDown';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';
  import { signUp } from '/@/hooks/apollo/gqlUser';
  import { useMutation } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { newWallet, saveWallet } from '/@/hooks/nkn/getNKN';
  import { SendVerifyCode } from '/@/components/NetFile/user';
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
      LoginFormTitle,
      [Col.name]: Col,
      [Row.name]: Row,
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
