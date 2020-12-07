<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <BasicForm @register="registerForm" layout="vertical">
      <template #publicKey="{ model, field }">
        <CountDown
          :value="model[field]"
          :placeholder="t('verificationPlaceholder')"
          @click="getVerifyCode"
          :title="t('send')"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { CountDown } from '/@/components/CountDown';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { sendVerifyCode, bindNknSecurityDevice } from '/@/hooks/apollo/gqlUser';
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
    components: { BasicModal, BasicForm, Divider, CountDown },
    setup() {
      const publicKey = ref('');
      const emailButton = ref(0);
      const button = computed(() => {
        return emailButton.value < 1
          ? t('sendVerifyCode')
          : `wait ${emailButton.value} ${t('seconds')}`;
      });
      const { createMessage, createErrorModal } = useMessage();
      const [registerForm, { validate, validateFields }] = useForm({
        schemas,
        showActionButtonGroup: false,
        compact: false,
      });
      const [register, { closeModal }] = useModalInner((data) => {});
      // 发送NKN验证码
      async function getVerifyCode() {
        if (emailButton.value > 0) {
          createMessage.error(`wait ${emailButton.value} ${t('seconds')}`);
          return;
        }
        const params = await validateFields(['publicKey']);
        useApollo()
          .mutate({
            mutation: sendVerifyCode,
            variables: {
              nkn: params.publicKey,
              type: 'ACTIVE_NKN',
            },
          })
          .then(() => {
            createMessage.success(t('verificationSend'));
            emailButton.value = 60;
            setInterval(() => {
              if (emailButton.value < 1) {
                emailButton.value = 0;
                clearInterval();
                return;
              }
              emailButton.value -= 1;
            }, 1000);
          })
          .catch((err) => {
            createErrorModal({ content: err });
          });
      }
      // 绑定设备
      async function bindDevice() {
        try {
          const data = await validate();
          await useApollo().mutate({
            mutation: bindNknSecurityDevice,
            variables: {
              code: data.code,
              nknPublicKey: data.publicKey,
              password: data.password,
            },
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
        button,
        emailButton,
        bindDevice,
      };
    },
  });
</script>
