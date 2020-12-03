<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <InputSearch v-model:value="code" placeholder="input Code" @search="getVerifyCode">
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
  import { getMe, useApollo } from '/@/hooks/apollo/apollo';
  import { sendVerifyCode, bindNknAddress } from '/@/hooks/apollo/gqlUser';

  const { t } = useI18n('general.security');
  const schemas: FormSchema[] = [
    {
      field: 'publicKey',
      component: 'Input',
      label: t('publicKey'),
      colProps: {
        span: 24,
      },
      rules: [{ required: true }],
    },
    {
      field: 'password',
      component: 'InputPassword',
      label: t('password'),
      colProps: {
        span: 24,
      },
      rules: [{ required: true }],
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, InputSearch: Input.Search, Divider },
    setup() {
      const code = ref('');
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

      async function getVerifyCode() {
        const user = await getMe();
        console.log(user);
        if (emailButton.value > 0) {
          createMessage.error(`wait ${emailButton.value} ${t('seconds')}`);
          return;
        }
        if (user.email === '') {
          createMessage.error(t('noEmail'));
          return;
        }
        if (
          user.email.match(`^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$`) ===
          null
        ) {
          createMessage.error(t('emailFormat'));
          return;
        }

        useApollo()
          .mutate({
            mutation: sendVerifyCode,
            variables: {
              email: user.email,
              type: 'CHANGE_INFO',
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
      async function bindDevice() {
        try {
          const data = await validate();
          await useApollo().mutate({
            mutation: bindNknAddress,
            variables: {
              code: code.value,
              nknPublicKey: data.publicKey,
              tag: 'LOGIN',
              password: data.password,
            },
          });
          createMessage.success('success');
          closeModal();
        } catch (err) {
          console.log(err);
        }
      }
      return { register, registerForm, getVerifyCode, code, t, button, emailButton, bindDevice };
    },
  });
</script>
