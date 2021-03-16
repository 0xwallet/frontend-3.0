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
          :placeholder="t('sys.login.nMobileCode')"
          :sendCodeApi="handleSendCode"
        />
      </FormItem>

      <FormItem class="enter-x">
        <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
          {{ t('sys.login.loginButton') }}
        </Button>
        <Button size="large" block class="mt-4" @click="handleBackLogin">
          {{ t('sys.login.back') }}
        </Button>
      </FormItem>
    </Form>
  </template>
</template>
<script lang="ts">
import {defineComponent, reactive, ref, computed, unref,} from 'vue';

  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';
  import {useMutation} from "@vue/apollo-composable";
  import {sendLoginCode,signIn} from "/@/hooks/apollo/gqlUser";
  import {useWallet} from "/@/hooks/nkn/getNKN";
  import {userStore} from "/@/store/modules/user";
  import {useMessage} from "/@/hooks/web/useMessage";

  export default defineComponent({
    name: 'nMobileForm',
    components: {
      Button,
      Form,
      FormItem: Form.Item,
      Input,
      CountdownInput,
      LoginFormTitle,
    },
    setup() {
      const { t } = useI18n();
      const { handleBackLogin, getLoginState,email } = useLoginState();
      const { getFormRules } = useFormRules();
      const{notification}=useMessage()
      const formRef = ref<any>(null);
      const loading = ref(false);

      const formData = reactive({
        email: '',
        sms: '',
      });


      formData.email=computed(()=>{
        return email.value
      })


      const { validForm } = useFormValid(formRef);

      const getShow = computed(() => unref(getLoginState) === LoginStateEnum.nMOBILE);

      async function handleLogin() {
        const data = await validForm();
        if (!data) return;
        console.log(data)
        await SignIn({email:data.email,code:data.sms,password:""})
      }
      const {mutate:SendLoginCode}=useMutation(sendLoginCode)
      const {mutate:SignIn,onDone}=useMutation(signIn)

      onDone(async (res) => {
        const data = await validForm();
        localStorage.setItem('token', res.data?.signin?.token || '');
        localStorage.setItem('uid', res.data?.signin?.User?.id || 0);
        await useWallet(data.email)
        notification.success({
          message: t('loginSuccessTitle'),
          description: `${t('loginSuccessDesc')}: ${res.data?.signin?.User?.email}`,
          duration: 3,
        });
        await userStore.login();
      });

      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);
        return await SendLoginCode(data);
      }


      return {
        t,
        formRef,
        formData,
        getFormRules,
        handleLogin,
        loading,
        handleBackLogin,
        getShow,handleSendCode
      };
    },
  });
</script>
