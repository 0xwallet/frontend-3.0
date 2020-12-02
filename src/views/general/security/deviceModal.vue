<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <InputSearch v-model:value="email" placeholder="input Email" @search="getVerifyCode">
      <template #enterButton>
        <a-button type="primary"> {{ button }}</a-button>
      </template>
    </InputSearch>
    <Divider />
    <BasicForm @register="registerForm" layout="vertical" />
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';

  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Input, Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { sendVerifyCode, bindNknAddress } from '/@/hooks/apollo/gqlUser';

  const { t } = useI18n('general.security');
  const schemas: FormSchema[] = [
    {
      field: 'code',
      component: 'Input',
      label: t('verifyCode'),
      colProps: {
        span: 24,
      },
      rules: [{ required: true }],
    },
    {
      field: 'publicKey',
      component: 'Input',
      label: t('publicKey'),
      colProps: {
        span: 24,
      },
      rules: [{ required: true }],
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, InputSearch: Input.Search, Divider },
    setup() {
      const email = ref('');

      const emailButton = ref(0);
      const button = computed(() => {
        return emailButton.value < 1
          ? t('sendVerifyCode')
          : `wait ${emailButton.value} ${t('seconds')}`;
      });
      const { createMessage, createErrorModal } = useMessage();
      const [registerForm, { validate }] = useForm({
        schemas,
        showActionButtonGroup: false,
        compact: false,
      });
      const [register, { closeModal }] = useModalInner((data) => {});

      function getVerifyCode() {
        if (emailButton.value > 0) {
          createMessage.error(`wait ${emailButton.value} ${t('seconds')}`);
          return;
        }
        if (email.value === '') {
          createMessage.error(t('noEmail'));
          return;
        }
        if (
          email.value.match(`^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$`) ===
          null
        ) {
          createMessage.error(t('emailFormat'));
          return;
        }

        useApollo()
          .mutate({
            mutation: sendVerifyCode,
            variables: {
              email: email.value,
              type: 'CHANGE_INFO',
            },
          })
          .finally(() => {
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
          });
      }
      async function bindDevice() {
        try {
          const data = await validate();
          console.log(data);
          await useApollo().mutate({
            mutation: bindNknAddress,
            variables: {
              code: data.code,
              nknPublicKey: data.publicKey,
              tag: 'LOGIN_CODE',
            },
          });
          createMessage.success('success');
          closeModal();
        } catch (err) {
          console.log(err);
        }
      }
      return { register, registerForm, getVerifyCode, email, t, button, emailButton, bindDevice };
    },
  });
</script>
