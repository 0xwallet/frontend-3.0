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
            <a-form-item name="password" :label="t('passwordLabel')">
              <a-input-password
                size="large"
                visibilityToggle
                v-model:value="formData.password"
                placeholder="password: 123456"
              >
                <template #addonBefore><LockOutlined /></template>
              </a-input-password>
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
            <a-form-item>
              <a-button
                type="primary"
                size="large"
                class="rounded-sm"
                :block="true"
                @click="
                  () => {
                    go('/register');
                  }
                "
                >{{ t('registerButton') }}</a-button
              >
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref, toRaw } from 'vue';
  import { Checkbox } from 'ant-design-vue';
  import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
  import { Button } from '/@/components/Button';
  import { AppLocalePicker } from '/@/components/Application';
  // import { BasicDragVerify, DragVerifyActionType } from '/@/components/Verify/index';

  import { userStore } from '/@/store/modules/user';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGlobSetting, useProjectSetting } from '/@/hooks/setting';
  import logo from '/@/assets/images/logo.png';
  import { useGo } from '/@/hooks/web/usePage';
  import { signIn } from '/@/hooks/apollo/gqlUser';
  import { useApollo } from '/@/hooks/apollo/apollo';

  import { useCrypto, useMClient, useWallet } from '/@/hooks/nkn/getNKN';
  import { useI18n } from '/@/hooks/web/useI18n';

  export default defineComponent({
    components: {
      //  BasicDragVerify,
      AButton: Button,
      ACheckbox: Checkbox,
      AppLocalePicker,
      MailOutlined,
      LockOutlined,
    },
    setup() {
      localStorage.setItem('walletJson', undefined);
      localStorage.setItem('walletPassword', undefined);
      localStorage.setItem('token', undefined);
      localStorage.setItem('uid', undefined);
      const formRef = ref<any>(null);
      const autoLoginRef = ref(false);
      // const verifyRef = ref<RefInstanceType<DragVerifyActionType>>(null);
      const go = useGo();
      const { notification, createErrorModal } = useMessage();

      const globSetting = useGlobSetting();
      const { locale } = useProjectSetting();
      const { t } = useI18n('sys.login');

      // const openLoginVerifyRef = computed(() => appStore.getProjectConfig.openLoginVerify);

      const formData = reactive({
        email: 'jinmao88@qq.com',
        password: '123456',
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

          useApollo()
            .mutate({
              mutation: signIn,
              variables: {
                email: data.email,
                password: data.password,
                code: '',
              },
            })
            .then((res) => {
              // 取得token，存入缓存
              console.log(res);
              useCrypto().then((CryptoJS) => {
                const secret = CryptoJS.enc.Base64.stringify(
                  CryptoJS.HmacSHA512(data.email, data.password)
                );
                localStorage.setItem('walletPassword', secret);
                localStorage.setItem(
                  'walletJson',
                  res?.data?.signin?.User?.wallets.filter((v) => v.tags[0] == 'MESSAGE')[0]?.info
                    ?.encryptedWallet
                );
                useWallet().then(() => {
                  console.log('wallet ready');
                  useMClient();
                });
              });

              // const wallet = res?.data?.signin?.User?.wallets.filter(
              //   (v) => v.tags[0] == 'MESSAGE'
              // )[0]?.info?.encryptedWallet;

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
                title: '错误',
                content: err.message,
              });
            });
        } catch {
        } finally {
          formState.loading = false;
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
      };
    },
  });
</script>
<style lang="less" scoped>
  @import (reference) '../../../design/index.less';

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
