<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('changePassword')"
    @ok="changePassword"
  >
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';

  import { getMe, useApollo } from '/@/hooks/apollo/apollo';
  import { resetPassword } from '/@/hooks/apollo/gqlUser';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useWallet, useNKN, saveWallet } from '/@/hooks/nkn/getNKN';
  import CryptoES from 'crypto-es';
  const { t } = useI18n('general.account');
  const schemas: FormSchema[] = [
    {
      field: 'oldPassword',
      component: 'InputPassword',
      label: t('oldPassword'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'newPassword',
      component: 'InputPassword',
      label: t('newPassword'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'newPassword2',
      component: 'InputPassword',
      label: t('newPassword2'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const modelRef = ref({});
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 180,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const { createErrorModal, createMessage } = useMessage();
      const [register, { closeModal }] = useModalInner();

      async function changePassword() {
        const data = await validateFields();
        try {
          const json = localStorage.getItem('walletJson');
          console.log(json);
          const oldWallet = await useWallet();

          const user = await getMe();
          const secret = CryptoES.enc.Base64.stringify(
            CryptoES.HmacSHA512(user.email, data.newPassword)
          );
          const NKN = await useNKN();
          let w = new NKN.Wallet({ seed: oldWallet.getSeed(), password: secret });
          const walletJson = JSON.stringify(w.toJSON());

          const res = await useApollo().mutate({
            mutation: resetPassword,
            variables: {
              email: user.email,
              encryptedWallet: walletJson,
              newPassword: data.newPassword,
              oldPassword: data.oldPassword,
              nknPublicKey: w.getPublicKey(),
            },
          });
          saveWallet({ email: user.email, password: data.newPassword, walletJson });
          localStorage.setItem('token', res.data?.resetPassword?.token || '');
          createMessage.success(t('changeSuccess'));
          //TODO 需要写业务
        } catch (err) {
          createErrorModal({ content: err.message });
        } finally {
          closeModal();
        }
      }

      return { register, registerForm, model: modelRef, changePassword, t };
    },
  });
</script>
