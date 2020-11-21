<template>
  <div class="login">
    <div class="login-mask" />
    <div class="login-form-wrap">
      <div class="login-form mx-6">
        <div class="login-form__content px-2 py-10">
          <header>
            <img :src="logo" class="mr-4" />
            <h1>{{ title }}</h1>
          </header>

          <a-form
            class="mx-auto mt-10"
            :model="formData"
            :rules="formRules"
            ref="formRef"
            layout="vertical"
          >
            <a-form-item name="email" label="EMAIL">
              <a-input size="large" v-model:value="formData.email" placeholder="email" />
            </a-form-item>
            <a-form-item name="password" label="密码">
              <a-input-password
                size="large"
                visibilityToggle
                v-model:value="formData.password"
                placeholder="Password: 123456"
              />
            </a-form-item>

            <!-- <a-form-item name="verify" v-if="openLoginVerify">
              <BasicDragVerify v-model:value="formData.verify" ref="verifyRef" />
            </a-form-item> -->
            <a-row>
              <a-col :span="12">
                <a-form-item>
                  <!-- 未做逻辑，需要自行处理 -->
                  <a-checkbox v-model:checked="autoLogin" size="small">自动登录</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :style="{ 'text-align': 'right' }">
                  <!-- 未做逻辑，需要自行处理 -->
                  <a-button type="link" size="small">忘记密码</a-button>
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
                >登录</a-button
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
                >注册</a-button
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
  import { Checkbox } from 'ant-design-vue';

  import Button from '/@/components/Button/index.vue';

  import { userStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useSetting } from '/@/hooks/core/useSetting';
  import logo from '/@/assets/images/logo.png';
  import { useGo } from '/@/hooks/web/usePage';
  import { signIn } from '/@/hooks/apollo/gqlUser';
  import { useApollo, useApolloWS } from '/@/hooks/apollo/apollo';
  import apollo from '/src/lib/esm/apollo';
  import Observable from 'zen-observable';
  import { driveFileUploaded } from '/@/hooks/apollo/gqlFile';
  import { useMClient, useWallet } from '/@/hooks/nkn/getNKN';

  export default defineComponent({
    components: {
      //  BasicDragVerify,
      AButton: Button,
      ACheckbox: Checkbox,
    },
    setup() {
      const formRef = ref<any>(null);
      const autoLoginRef = ref(false);
      // const verifyRef = ref<RefInstanceType<DragVerifyActionType>>(null);
      const go = useGo();
      const { globSetting } = useSetting();
      const { notification, createErrorModal } = useMessage();

      // const openLoginVerifyRef = computed(() => appStore.getProjectConfig.openLoginVerify);

      const formData = reactive({
        email: 'jinmao88@qq.com',
        password: '123456',
      });
      const formState = reactive({
        loading: false,
      });

      const formRules = reactive({
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
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
              localStorage.setItem('token', res.data?.signin?.token || '');
              localStorage.setItem('uid', res.data?.signin?.User?.id || 0);
              useWallet().then(() => {
                console.log('wallet ready');
                useMClient();
              });
              // websocket调试;

              notification.success({
                message: '登录成功',
                description: `欢迎回来: ${res.data?.signin?.User?.email}`,
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
      };
    },
  });
</script>
<style lang="less" scoped>
  @import (reference) '../../../design/index.less';

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
      width: 520px;
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
        height: 90%;
        justify-content: center;
        align-items: center;
        .respond-to(large, {
          width: 600px;
          right: calc(50% - 270px);
          });
        .respond-to(xlarge, { width: 100vw; right:0});
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
            width: 48px;
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
