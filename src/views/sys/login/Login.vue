<template>
  <div class="login">
    <div class="login-mask" />
    <div class="login-form-wrap">
      <div class="login-form mx-6">
        <div class="login-form__content px-2 py-10">
          <AppLocalePicker v-if="showLocale" class="login-form__locale" />
          <header>
            <img :src="logo" />
          </header>

          <a-form
            class="mx-auto mt-10"
            :model="formData"
            :rules="formRules"
            ref="formRef"
            layout="vertical"
          >
            <a-form-item name="email" :label="t('emailLabel')">
              <a-input size="large" v-model:value="formData.email" placeholder="email">
                <template #addonBefore><MailOutlined /></template
              ></a-input>
            </a-form-item>
            <a-form-item
              name="password"
              :label="loginMode === 'basic' ? t('passwordLabel') : t('nknVerifyCode')"
            >
              <a-input-password
                size="large"
                visibilityToggle
                v-model:value="formData.password"
                placeholder="password"
                v-if="loginMode === 'basic'"
              >
                <template #addonBefore><LockOutlined /></template>
              </a-input-password>
              <CountDown
                :value="formData.password"
                :placeholder="t('verificationPlaceholder')"
                @click="getVerifyCode"
                v-if="loginMode === 'nkn'"
                :title="t('send')"
              />
            </a-form-item>

            <!-- <a-form-item name="verify" v-if="openLoginVerify">
              <BasicDragVerify v-model:value="formData.verify" ref="verifyRef" />
            </a-form-item> -->
            <a-row>
              <a-col :span="12">
                <a-form-item>
                  <a-checkbox v-model:checked="autoLogin" size="small">{{
                    t('sys.login.autoLogin')
                  }}</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :style="{ 'text-align': 'right' }">
                  <!-- No logic, you need to deal with it yourself -->
                  <a-button type="link" size="small">{{ t('forgetPassword') }}</a-button>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <a-button
                type="primary"
                size="large"
                class="rounded-sm"
                :block="true"
                @click="login"
                :loading="formState.loading"
                >{{ t('loginButton') }}</a-button
              >
            </a-form-item>
          </a-form>
          <Divider>or</Divider>
          <Row :gutter="20" type="flex" justify="center">
            <Col :span="8" class="center"><a-button type="link">WebAuth</a-button></Col>
            <Col :span="8" class="center"
              ><a-button type="link" @click="changeLoginMode">{{
                loginMode === 'basic' ? 'NKN' : t('passwordLabel')
              }}</a-button></Col
            >
            <Col :span="8" class="center"
              ><a-button
                type="link"
                @click="
                  () => {
                    go('/register');
                  }
                "
                >{{ t('registerButton') }}</a-button
              ></Col
            >
          </Row>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, reactive, ref, unref } from 'vue';
  import { Checkbox, Divider, Row, Col, Input } from 'ant-design-vue';
  import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
  import { Button } from '/@/components/Button';
  import { AppLocalePicker } from '/@/components/Application';
  import { userStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGlobSetting, useProjectSetting } from '/@/hooks/setting';
  import logo from '/@/assets/images/logo.png';
  import { useGo } from '/@/hooks/web/usePage';
  import { signIn, sendLoginCode } from '/@/hooks/apollo/gqlUser';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { useMClient, useWallet, saveWallet } from '/@/hooks/nkn/getNKN';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CountDown } from '/@/components/CountDown';

  export default defineComponent({
    components: {
      AButton: Button,
      ACheckbox: Checkbox,
      AppLocalePicker,
      MailOutlined,
      LockOutlined,
      Divider,
      Row,
      Col,
      InputSearch: Input.Search,
      CountDown,
    },
    setup() {
      localStorage.setItem('walletJson', '');
      localStorage.setItem('walletPassword', '');
      localStorage.setItem('token', '');
      localStorage.setItem('uid', '');
      const loginMode = ref('basic');
      const formRef = ref<any>(null);
      const autoLoginRef = ref(false);
      const emailButton = ref(0);
      const button = computed(() => {
        return emailButton.value < 1 ? t('send') : `wait ${emailButton.value} ${t('seconds')}`;
      });
      // const verifyRef = ref<RefInstanceType<DragVerifyActionType>>(null);
      const go = useGo();
      const { notification, createErrorModal, createMessage } = useMessage();

      const globSetting = useGlobSetting();
      const { locale } = useProjectSetting();
      const { t } = useI18n('sys.login');

      // const openLoginVerifyRef = computed(() => appStore.getProjectConfig.openLoginVerify);

      const formData = reactive({
        // email: 'jinmao88@qq.com',
        // password: '123456',
      });
      const formState = reactive({
        loading: false,
      });

      const formRules = reactive({
        email: [{ required: true, message: t('emailPlaceholder'), trigger: 'blur' }],
        password: [{ required: true, message: t('passwordPlaceholder'), trigger: 'blur' }],
        // verify: unref(openLoginVerifyRef) ? [{ required: true, message: '请通过验证码校验' }] : [],
      });

      async function handleLogin() {
        const form = unref(formRef);
        if (!form) return;
        formState.loading = true;
        try {
          const data = await form.validate();
          // 登录
          let variables = { email: data.email, password: '', code: '' };
          if (loginMode.value === 'baisc') {
            variables.password = data.password;
          } else {
            variables.code = data.password;
          }
          useApollo()
            .mutate({
              mutation: signIn,
              variables,
            })
            .then((res) => {
              // 取得token，存入缓存

              useWallet();
              // 保存wallet信息
              saveWallet({
                email: variables.email,
                password: variables.password,
                walletJson: res.data.signin.User.wallets.filter((v) => v.tags[0] === 'MESSAGE')[0]
                  .info.encryptedWallet,
              });

              localStorage.setItem('token', res.data?.signin?.token || '');
              localStorage.setItem('uid', res.data?.signin?.User?.id || 0);

              // websocket调试;

              notification.success({
                message: t('loginSuccessTitle'),
                description: `${t('loginSuccessDesc')}: ${res.data?.signin?.User?.email}`,
                duration: 3,
              });
              userStore.login();
            })
            .catch((err) => {
              createErrorModal({
                content: err.message,
              });
            });
        } catch {
        } finally {
          formState.loading = false;
          useWallet().then(() => {
            console.log('wallet ready');
            useMClient();
          });
        }
      }
      async function changeLoginMode() {
        if (loginMode.value === 'basic') {
          loginMode.value = 'nkn';
        } else {
          loginMode.value = 'basic';
        }
      }
      async function getVerifyCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);
        try {
          await useApollo().mutate({
            mutation: sendLoginCode,
            variables: {
              email: data.email,
            },
          });
          createMessage.success(t('verificationSend'));
        } catch (err) {
          createErrorModal({
            content: err.message,
          });
        }
      }
      return {
        formRef,
        // verifyRef,
        formData,
        formState,
        formRules,
        login: handleLogin,
        autoLogin: autoLoginRef,
        // openLoginVerify: openLoginVerifyRef,
        title: globSetting && globSetting.title,
        logo,
        go,
        t,
        showLocale: locale.show,
        changeLoginMode,
        loginMode,
        getVerifyCode,
        button,
      };
    },
  });
</script>
<style lang="less" scoped>
  @import (reference) '../../../design/index.less';

  .center {
    text-align: center;
  }

  .login-form__locale {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 1;
  }

  .login {
    position: relative;
    height: 100vh;
    background: url(../../../assets/images/login/login-bg.png) no-repeat;
    background-size: 100% 100%;

    &-mask {
      display: none;
      height: 100%;
      background: url(../../../assets/images/login/login-in.png) no-repeat;
      background-position: 30% 30%;
      background-size: 80% 80%;

      .respond-to(xlarge, { display: block;});
    }

    &-form {
      position: relative;
      bottom: 60px;
      width: 400px;
      background: @white;
      border: 10px solid rgba(255, 255, 255, 0.5);
      border-width: 8px;
      border-radius: 4px;
      background-clip: padding-box;
      .respond-to(xlarge, { margin: 0 50px 0 50px});

      &-wrap {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        width: 100%;
        height: 100%;
        // height: 90%;
        justify-content: center;
        align-items: center;
        .respond-to(large, {
          width: 600px;
          right: calc(50% - 270px);
          });
        .respond-to(xlarge, { width: 100vw; right:0});
      }

      &__locale {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      &__content {
        position: relative;
        width: 100%;
        height: 100%;
        border: 1px solid #999;
        border-radius: 2px;

        header {
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            display: inline-block;
            width: 70%;
          }

          h1 {
            margin-bottom: 0;
            font-size: 24px;
            // color: @primary-color;
            text-align: center;
          }
        }

        form {
          width: 80%;
        }
      }
    }
  }
</style>
