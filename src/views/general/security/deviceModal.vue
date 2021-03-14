<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <BasicForm @register="registerForm" layout="vertical">
      <template #code="{ model, field }">
        <CountdownInput
          size="large"
          v-model:value="model[field]"
          :placeholder="t('verifyCode')"
          :sendCodeApi="handleSendCode"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { bindNknSecurityDevice } from '/@/hooks/apollo/gqlUser';
  import { useMutation } from '@vue/apollo-composable';
  import { SendVerifyCode } from '/@/components/NetFile/user';
  import { CountdownInput } from '/@/components/CountDown';
  const { t } = useI18n('general.security');
  const schemas: FormSchema[] = [
    {
      field: 'nknPublicKey',
      component: 'Input',
      label: t('publicKey'),
      colProps: {
        span: 24,
      },
      required:true
    },
    {
      field: 'code',
      component: 'Input',
      label: t('nknVerifyCode'),
      required:true,
      slot:'code',
      colProps: {
        span: 24,
      },
    },
    {
      field: 'password',
      component: 'InputPassword',
      label: t('password'),
      required:true,
      colProps: {
        span: 24,
      },
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Divider, CountdownInput },
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

      async function handleSendCode() {
        const params = await validateFields(['nknPublicKey']);
        return await SendVerifyCode({
          nkn: params.nknPublicKey,
          type: 'ACTIVE_NKN',
        });
      }

      const { mutate: BindDevice } = useMutation(bindNknSecurityDevice);
      // 绑定设备
      async function bindDevice() {
        try {
          const data = await validate();
          await BindDevice(data);
          createMessage.success('success');
          closeModal();
        } catch (err) {
          createErrorModal({ content: err });
        }
      }
      return {
        register,
        registerForm,
        handleSendCode,
        publicKey,
        t,
        bindDevice,
      };
    },
  });
</script>
