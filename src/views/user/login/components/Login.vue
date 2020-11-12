<template>
  <div class="login-mode">
    <RadioGroup
      v-model:value="type"
      button-style="solid"
    >
      <RadioButton value="password">
        密码登陆
      </RadioButton>
      <RadioButton value="code">
        邮箱登陆
      </RadioButton>
    </RadioGroup>
  </div>
  <a-form
    ref="formRef"
    class="front-login"
    :model="formData"
    :rules="formRules"
  >
    <a-form-item name="email">
      <a-input
        v-model:value="formData.email"
        size="large"
        placeholder="请输入邮箱"
      />
    </a-form-item>
    <a-form-item
      v-show="type === 'password'"
      name="password"
    >
      <a-input-password
        v-model:value="formData.password"
        autofocus="autofocus"
        size="large"
        visibility-toggle
        placeholder="请输入密码"
      />
    </a-form-item>
    <a-form-item
      v-show="type === 'code'"
      name="code"
    >
      <a-input
        v-model:value="formData.code"
        class="user-login-verify"
        size="large"
        placeholder="请输入验证码"
      >
        <template #suffix>
          <div
            class="user-login-verify-code light"
            :class="verifyStyle"
            @click.stop="sendLoginCode"
          >
            {{ verifyLabel }}
          </div>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        size="large"
        class="rounded-sm"
        block
        :loading="formState.loading"
        @click="login"
      >
        登录
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, unref, computed } from 'vue';
import Radio from 'ant-design-vue/lib/radio';
import { useStore } from 'vuex';
import { useFormValid } from '@/hooks/web/useValidate';
import { useApollo } from '@/hooks/api/graphql';
import { useVerifyTime } from '@/hooks/change/time';
export default defineComponent({
  name: 'Login',
  components: {
    RadioButton: Radio.Button,
    RadioGroup: Radio.Group
  },
  props: {
    mode: {
      type: String,
      default: ''
    }
  },
  setup() {
    type Key = 'password' | 'code';
    const type = ref<Key>('password');

    const formRef = ref<any>(null);

    const [loginCode, reset] = useVerifyTime(
      Number(sessionStorage.getItem('verifyTime')) || 0,
      60,
      0,
      1,
      true,
      (time: string) => {
        sessionStorage.setItem('verifyTime', time);
      },
    );

    const formData = reactive({
      email: '',
      password: '',
      code: '',
    });

    const formState = reactive({
      loading: false,
    });

    const verifyLabel = computed(() => (loginCode.value ? loginCode.value : '验证码'));

    let hasClick = false;
    async function sendLoginCode() {
      if (loginCode.value || hasClick) {
        return;
      }
      hasClick = true;
      try {
        await useApollo().user.sendLoginCode({ email: formData.email });
        reset();
      } finally {
        hasClick = false;
      }
    }

    const verifyStyle = computed(() =>
      loginCode.value ? ['board-gray', 'not-allowed'] : ['board-blue', 'pointer'],
    );
    
    const formRules = computed(() => {
      return {password:useFormValid(['email', 'password']), code: useFormValid(['email', 'code'])}[type.value]
    });
    const dispatch = useStore().dispatch;
    async function handleLogin() {
      const form = unref(formRef);
      if (!form) return;
      formState.loading = true;
      try {
        const data = await form.validate();
        if (!data) {
          return;
        }
        await dispatch('user/login', {
          password: formData.password,
          email: formData.email,
          code: formData.code
        });
      } finally {
        formState.loading = false;
      }
    }

    return {
      type,
      verifyLabel,
      formRef,
      formData,
      formState,
      formRules,
      sendLoginCode,
      verifyStyle,
      login: handleLogin
    };
  },
});
</script>

<style lang="less">
.front-login {
  width: 80%;
  margin: 0 auto;
}
.login-mode {
  text-align: center;
  padding: 1rem;
}
</style>
