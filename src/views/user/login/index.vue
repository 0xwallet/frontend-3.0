<template>
  <div class="login">
    <div class="login-mask" />
    <div class="login-form-wrap">
      <div class="login-form">
        <div class="login-form__content">
          <header>
            <!-- <img src="../../../assets/logo.png" /> -->
            <h1>{{ componentType.title }}</h1>
          </header>
          <component
            :is="componentType.componentName"
            :mode="componentType.mode"
            class="user-login-component"
          />
          <footer class="login-router clear-float">
            <!-- <router-link v-show="type === 'Login'" class="login-router-nkn left">nkn登陆</router-link> -->
            <router-link
              v-show="componentType.mode === 'login'"
              :to="{ name: 'login', params: { type: 'register' } }"
              class="login-router-register right"
            >
              注册账号
            </router-link>
            <router-link
              v-show="componentType.mode === 'login'"
              :to="{ name: 'login', params: { type: 'forgetpassword' } }"
              class="login-router-forget-password right"
            >
              忘记密码
            </router-link>
            <router-link
              v-show="componentType.mode === 'nkn'"
              :to="{ name: 'login', params: { type: 'login' } }"
              class="login-router-account left"
            >
              账号登陆
            </router-link>
            <router-link
              v-show="['register', 'forgetpassword'].includes(componentType.mode)"
              :to="{ name: 'login', params: { type: 'login' } }"
              class="login-router-account left"
            >
              返回登陆
            </router-link>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
// import { useMessage } from '@/hooks/web/useMessage';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import ForgetPassword from './components/ForgetPassword.vue';

export default defineComponent({
  components: {
    Login,
    Register,
    ForgetPassword,
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  setup(props: { [key: string]: string }) {
    const components: { [key: string]: { componentName: string; title: string; mode: string } } = {
      login: { componentName: 'Login', title: '登陆', mode: 'login' },
      register: { componentName: 'Register', title: '注册', mode: 'register' },
      forgetpassword: { componentName: 'ForgetPassword', title: '重置密码', mode: 'forgetpassword' },
      nkn: { componentName: 'Login', title: 'nkn登陆', mode: 'nkn' }
    };
    const componentType = computed(() => components[props.type.toLowerCase()]);
    return {
      componentType
    };
  },
});
</script>
<style lang="less">
.login {
  position: relative;
  height: 100vh;
  background-color: var(--theme-color);
  background-size: 100% 100%;

  &-mask {
    display: block;
    height: 100%;
    background: url('../../../assets/images/login/dark.png') no-repeat;
    background-size: 100% 100%;
  }
  
  .user-login-verify {
      .ant-input-suffix {
        right: 0;
        height: 100%;
      }
      &-code {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: var(--h-4);
      }
    }

  .ant-form-item-control-wrapper {
    width: 100%;
  }

  &-form {
    width: 30%;
    background: white;
    border: 10px solid rgba(255, 255, 255, 0.5);
    border-width: 10px;
    border-radius: 4px;
    background-clip: padding-box;

    &-wrap {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      padding: 0 5vw;
      display: flex;
      justify-content: flex-end;
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
        padding-bottom: 1vh;
        img {
          display: inline-block;
          width: 80px;
        }

        h1 {
          margin-bottom: 0;
          font-size: var(--h-2);
          color: var(--text-color);
          text-align: center;
        }
      }
    }
  }
  .user-login-component {
    width: 80%;
    margin: 0 auto;
  }
  .login-router {
    margin: 0.5rem;
    a {
      margin-right: 0.5rem;
    }
    &-nkn {
    }
    &-register {
    }
    &-forget-password {
    }
    &-account {
    }
  }
}
</style>
