<template>
  <div class="login">
    <div class="login-mask" />
    <div class="login-form-wrap">
      <div class="login-form mx-6">
        <AppLocalePicker v-if="showLocale" class="login-form__locale" />
        <div class="login-form__content px-2 py-10">
          <header>
            <img :src="logo" />
          </header>
          <a-form
            class="mx-auto mt-10 main"
            :model="formData"
            layout="vertical"
            :rules="formRules"
            ref="formRef"
          >
            <a-form-item name="email" label="Email">
              <a-input v-model:value="formData.email" placeholder="Email" />
              <div class="email-button"
                ><a-button @click="getVerifyCode" :disabled="emailButton !== 0"
                  >{{ t('verificationButton')
                  }}{{ emailButton === 0 ? '' : '(' + emailButton + t('seconds') + ')' }}</a-button
                >
                {{ info }}
              </div>
            </a-form-item>
            <a-form-item name="code" :label="t('verification')">
              <a-input v-model:value="formData.code" placeholder="verifyCode" />
            </a-form-item>
            <a-form-item name="password" :label="t('passwordLabel')">
              <a-input-password
                visibilityToggle
                v-model:value="formData.password"
                placeholder="Password"
              />
            </a-form-item>
            <a-form-item name="password2" :label="t('passwordLabel2')">
              <a-input-password
                visibilityToggle
                v-model:value="formData.password2"
                placeholder="Password"
              />
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                class="rounded-sm"
                :block="true"
                :loading="formState.loading"
                @click="register"
                >{{ t('registerButton') }}</a-button
              >
            </a-form-item>
            <a-form-item>
              <a-button
                type="link"
                class="rounded-sm"
                :block="true"
                @click="
                  () => {
                    go('/login');
                  }
                "
                >{{ t('backLoginButton') }}</a-button
              >
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref } from 'vue';
  import { Checkbox, Form, Input } from 'ant-design-vue';
  import { Button } from '/@/components/Button';
  import { useMessage } from '/@/hooks/web/useMessage';
  import logo from '/@/assets/images/logo.png';
  import { useGo } from '/@/hooks/web/usePage';
  import { sendVerifyCode, signUp } from '/@/hooks/apollo/gqlUser';
  import { newWallet, saveWallet } from '/@/hooks/nkn/getNKN';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation } from '@vue/apollo-composable';
  import { AppLocalePicker } from '/@/components/Application';
  export default defineComponent({
    components: {
      AButton: Button,
      ACheckbox: Checkbox,
      [Form.name]: Form,
      [Form.Item.name]: Form.Item,
      [Input.name]: Input,
      [Input.Password.name]: Input.Password,
      AppLocalePicker,
    },
    setup() {
      const formRef = ref<any>(null);
      const go = useGo();
      const globSetting = useGlobSetting();
      const { notification, createErrorModal } = useMessage();
      const info = ref('');
      const emailButton = ref(0);
      const { t } = useI18n('sys.login');
      const formData = reactive({
        email: '',
        password: '',
        password2: '',
        code: '',
        // verify: undefined,
      });
      const formState = reactive({
        loading: false,
      });

      const formRules = reactive({
        email: [{ required: true, message: t('emailPlaceholder'), trigger: 'blur' }],
        password: [{ required: true, message: t('passwordPlaceholder'), trigger: 'blur' }],
        password2: [{ required: true, message: t('passwordPlaceholder'), trigger: 'blur' }],
        code: [{ required: true, message: t('verificationPlaceholder'), trigger: 'blur' }],
      });
      const { locale } = useProjectSetting();
      const { mutate: SendCode, onDone } = useMutation(sendVerifyCode);
      const { mutate: SignUp } = useMutation(signUp);
      onDone(() => {
        emailButton.value = 60;
        //TODO 先用定时器，之后换缓存
        setInterval(() => {
          if (emailButton.value > 0) {
            emailButton.value -= 1;
          }
          if (emailButton.value === 0) {
            clearInterval();
          }
        }, 1000);
        info.value = t('verificationSend');
      });
      function getVerifyCode() {
        if (formData.email === '') {
          info.value = '未输入邮箱';
          return;
        }
        if (
          formData.email.match(`^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$`) ===
          null
        ) {
          info.value = '邮箱格式不正确';
          return;
        }
        SendCode({
          email: formData.email,
          type: 'ACTIVE_EMAIL',
        });
      }
      async function register() {
        const form = unref(formRef);
        if (!form) return;
        formState.loading = true;

        try {
          const data = await form.validate();

          const wallet = await newWallet({ email: data.mail, password: data.password });
          // 注册账号
          await SignUp({
            email: data.email,
            password: data.password,
            code: data.code,
            username: data.email.split('@')[0],
            nknEncryptedWallet: wallet.json,
            nknPublicKey: wallet.publicKey,
          });
          saveWallet({ email: data.email, password: data.password, walletJson: wallet.json });
          notification.success({
            message: t('registerSuccess'),
            duration: 3,
          });
          go('/login');
        } catch (error) {
          createErrorModal({ content: error });
        } finally {
          formState.loading = false;
        }
      }

      return {
        formRef,
        formData,
        formState,
        formRules,
        title: globSetting && globSetting.title,
        logo,
        go,
        t,
        getVerifyCode,
        info,
        emailButton,
        register,
        showLocale: locale.show,
      };
    },
  });
</script>
<style lang="less" scoped>
  //@import (reference) '../../../design/index.less';

  .email-button {
    margin-top: 2px;
    color: #ff4d4f;
  }

  .main {
    margin: 0 auto 0 auto !important;
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
      background: url(../../../assets/images/login/login-in.png) no-repeat 30% 30%;
      background-size: 80% 80%;
    }

    &-form {
      position: relative;
      width: 400px;
      height: 50vh;
      background: @white;
      border: 10px solid rgba(255, 255, 255, 0.5);
      border-width: 8px;
      border-radius: 4px;
      background-clip: padding-box;

      &-wrap {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        width: 100%;
        //height: 90%;
        justify-content: center;
        align-items: center;
      }

      &__content {
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
