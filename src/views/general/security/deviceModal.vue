<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <BasicForm @register="registerForm" layout="vertical">
      <!--      <template #publicKey="{ model, field }">-->
      <!--        <CountDown-->
      <!--          :value="model[field]"-->
      <!--          :placeholder="t('verificationPlaceholder')"-->
      <!--          @click="getVerifyCode"-->
      <!--          :title="t('send')"-->
      <!--        />-->
      <!--      </template>-->
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  // import { CountDown } from '/@/components/CountDown';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { sendVerifyCode, bindNknSecurityDevice } from '/@/hooks/apollo/gqlUser';
  import { useMutation } from '@vue/apollo-composable';
  const { t } = useI18n('general.security');
  const schemas: FormSchema[] = [
    {
      field: 'publicKey',
      component: 'Input',
      label: t('publicKey'),
      colProps: {
        span: 24,
      },
      slot: 'publicKey',
      rules: [{ required: true }],
    },
    {
      field: 'code',
      component: 'Input',
      label: t('nknVerifyCode'),
      rules: [{ required: true }],
      colProps: {
        span: 24,
      },
    },
    {
      field: 'password',
      component: 'InputPassword',
      label: t('password'),
      rules: [{ required: true }],
      colProps: {
        span: 24,
      },
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Divider },
    setup() {
      const publicKey = ref('');
      const { createMessage, createErrorModal } = useMessage();
      const [registerForm, { validate, validateFields }] = useForm({
        schemas,
        showActionButtonGroup: false,
        compact: false,
      });
      const [register, { closeModal }] = useModalInner((data) => {});
      // 发送NKN验证码
      const { mutate: SendCode } = useMutation(sendVerifyCode);
      async function getVerifyCode() {
        const params = await validateFields(['publicKey']);
        await SendCode({
          nkn: params.publicKey,
          type: 'ACTIVE_NKN',
        });
      }
      const { mutate: BindDevice } = useMutation(bindNknSecurityDevice);
      // 绑定设备
      async function bindDevice() {
        try {
          const data = await validate();
          await BindDevice({
            code: data.code,
            nknPublicKey: data.publicKey,
            password: data.password,
          });
          createMessage.success('success');
          closeModal();
        } catch (err) {
          createErrorModal({ content: err });
        }
      }
      return {
        register,
        registerForm,
        getVerifyCode,
        publicKey,
        t,
        bindDevice,
      };
    },
  });
</script>
