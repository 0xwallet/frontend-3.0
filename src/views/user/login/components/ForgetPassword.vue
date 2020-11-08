<template>
  <a-form
    ref="formRef"
    class="front-register"
    :model="formData"
  >
    <a-form-item v-bind="validateInfos.email">
      <a-input
        v-model:value="formData.email"
        size="large"
        placeholder="请输入邮箱"
      />
    </a-form-item>
    <a-form-item v-bind="validateInfos.oldPassword">
      <a-input-password
        v-model:value="formData.oldPassword"
        autofocus="autofocus"
        size="large"
        visibility-toggle
        placeholder="请输入旧密码"
      />
    </a-form-item>
    <a-form-item v-bind="validateInfos.newPassword">
      <a-input-password
        v-model:value="formData.oldPassword"
        autofocus="autofocus"
        size="large"
        visibility-toggle
        placeholder="请输入新密码"
      />
    </a-form-item>
    <a-form-item v-bind="validateInfos.code">
      <a-input
        v-model:value="formData.code"
        class="user-login-verify"
        size="large"
        placeholder="请输入邮箱号"
      >
        <template #suffix>
          <div
            class="user-login-verify-code light"
            :class="verifyStyle"
            @click.stop="sendVerifyCode"
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
        @click="resetPassword"
      >
        注册
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, unref, computed } from 'vue';
import { useStore } from 'vuex';
import { useFormValid } from '@/hooks/web/useValidate';
import { useApollo } from '@/hooks/api/graphql';
import { useVerifyTime } from '@/hooks/change/time';
import { useForm } from '@ant-design-vue/use';
export default defineComponent({
  name: 'Register',
  setup () {
    const formRef = ref<any>(null);
    const formData = reactive({
      email: '',
      password: '',
      code: '',
    });

    const formState = reactive({
      loading: false,
    });

    const formRules = useFormValid(['email', ['password', 'oldPassword'], ['password', 'newPassword'], 'code']);
    const { validateInfos } = useForm(formData, formRules);
    const [time, reset] = useVerifyTime(
      Number(sessionStorage.getItem('verifyTime')) || 0,
      60,
      0,
      1,
      true,
      (time: string) => {
        sessionStorage.setItem('verifyTime', time);
      },
    );
    
    const verifyLabel = computed(() => (time.value ? time.value : '验证码'));

    let hasClick = false;
    async function sendVerifyCode() {
      if (time.value || hasClick) {
        return;
      }
      hasClick = true;
      try {
        await useApollo().user.sendVerifyCode({ email: formData.email, type: 'RESET_PASSWORD' });
        reset();
      } finally {
        hasClick = false;
      }
    }

    const verifyStyle = computed(() =>
      time.value ? ['board-gray', 'not-allowed'] : ['board-blue', 'pointer'],
    );

    const dispatch = useStore().dispatch;
    async function resetPassword() {
      const form = unref(formRef);
      if (!form) return;
      formState.loading = true;
      try {
        await dispatch('user/register', {
          password: formData.password,
          email: formData.email,
          code: formData.code,
          username: formData.email.split('@')[0]
        });
      } finally {
        formState.loading = false;
      }
    }

    return {
      formRef,
      formData,
      formState,
      verifyStyle,
      verifyLabel,
      sendVerifyCode,
      validateInfos,
      resetPassword
    };
  }
});
</script>

<style lang="less">
</style>