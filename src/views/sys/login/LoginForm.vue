<template>
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
    <FormItem name="email" class="enter-x">
      <Input size="large" v-model:value="formData.email" :placeholder="t('sys.login.email')" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.login.password')"
      />
    </FormItem>

    <Row class="enter-x">
      <Col :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </Col>
      <Col :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </Col>
    </Row>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
      <!-- <Button size="large" class="mt-4 enter-x" block @click="handleRegister">
        {{ t('sys.login.registerButton') }}
      </Button> -->
    </FormItem>
    <Row class="enter-x">
      <Col :xs="24" :md="8">
        <Tooltip>
          <template #title>{{ t('sys.login.webAuthnTooltip') }}</template>
          <Button block @click="setLoginState(LoginStateEnum.QR_CODE)"> WebAuthn </Button>
        </Tooltip>
      </Col>
      <Col :md="8" :xs="24" class="xs:my-2 md:my-0 xs:mx-0 md:mx-2">
        <Tooltip>
          <template #title>{{ t('sys.login.nMobileTooltip') }}</template>
          <Button block @click="setLoginState(LoginStateEnum.nMOBILE, formData.email)">
            nMobile
          </Button>
        </Tooltip>
      </Col>
      <Col :md="7" :xs="24">
        <Tooltip>
          <template #title>{{ t('sys.login.registerTooltip') }}</template>
          <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
            {{ t('sys.login.registerButton') }}
          </Button>
        </Tooltip>
      </Col>
    </Row>

    <Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>

    <!--    <div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">-->
    <!--      <GithubFilled />-->
    <!--      <WechatFilled />-->
    <!--      <AlipayCircleFilled />-->
    <!--      <GoogleCircleFilled />-->
    <!--      <TwitterCircleFilled />-->
    <!--    </div>-->
    <div class="grid grid-cols-1 gap-2">
      <div class="rounded-md border-2 h-14 border-light-blue-500 grid justify-items-center">
        <div class="text-light-blue-500 font-medium self-center">
          {{ t('sys.login.recoveryInfoButton') }}</div
        >
      </div>
      <div class="rounded-md border-2 h-14 border-light-blue-500 grid justify-items-center">
        <div class="text-light-blue-500 font-medium self-center">{{
          t('sys.login.walletProviderButton')
        }}</div>
      </div>
    </div>
  </Form>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref, computed } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button, Divider, Tooltip } from 'ant-design-vue';
  import {
    GithubFilled,
    WechatFilled,
    AlipayCircleFilled,
    GoogleCircleFilled,
    TwitterCircleFilled,
  } from '@ant-design/icons-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMutation } from '@vue/apollo-composable';
  import { useMClient, useWallet } from '/@/hooks/nkn/getNKN';
  import { signIn } from '/@/hooks/apollo/gqlUser';

  export default defineComponent({
    name: 'LoginForm',
    components: {
      Col,
      Row,
      Checkbox,
      Button,
      Form,
      FormItem: Form.Item,
      Input,
      Divider,
      LoginFormTitle,
      InputPassword: Input.Password,
      GithubFilled,
      WechatFilled,
      AlipayCircleFilled,
      GoogleCircleFilled,
      TwitterCircleFilled,
      Tooltip,
    },
    setup() {
      const { t } = useI18n();
      const { notification } = useMessage();
      const { prefixCls } = useDesign('login');
      const userStore = useUserStore();

      const { setLoginState, getLoginState } = useLoginState();
      const { getFormRules } = useFormRules();

      const formRef = ref();
      const loading = ref(false);
      const rememberMe = ref(false);

      const formData = reactive({
        email: '',
        password: '',
      });
      const { validForm } = useFormValid(formRef);
      const { mutate: SignIn, onDone } = useMutation(signIn);
      const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);
      onDone(async (res) => {
        const data = await validForm();
        localStorage.setItem('token', res.data?.signin?.token || '');
        localStorage.setItem('uid', res.data?.signin?.User?.id || 0);
        await useWallet(data.email);
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${res.data?.signin?.User?.username}`,
          duration: 3,
        });

        await userStore.login();
        await useMClient();

        loading.value = false;
      });
      async function handleLogin() {
        loading.value = true;
        try {
          const data = await validForm();
          data.code = '';
          // 登录
          await SignIn(data);
        } catch (err) {
          console.log(err);
          loading.value = false;
        } finally {
        }
      }

      return {
        t,
        prefixCls,
        formRef,
        formData,
        getFormRules,
        rememberMe,
        handleLogin,
        loading,
        setLoginState,
        LoginStateEnum,
        getShow,
      };
    },
  });
</script>
