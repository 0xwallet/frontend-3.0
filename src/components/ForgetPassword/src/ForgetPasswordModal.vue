<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('changePassword')"
    @ok="changePassword"
  >
    <Divider />
    <BasicForm @register="registerForm" :model="model" layout="vertical">
      <template #code="{ model, field }">
        <CountDown
          v-model:value="model[field]"
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
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { getMe, useApollo } from '/@/hooks/apollo/apollo';
  import { resetPassword, sendVerifyCode } from '/@/hooks/apollo/gqlUser';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useWallet, useNKN, saveWallet } from '/@/hooks/nkn/getNKN';
  import CryptoES from 'crypto-es';
  import { Divider, Row, Col, Button } from 'ant-design-vue';
  import { CountDown } from '/@/components/CountDown';

  const { t } = useI18n('general.account');
  const schemas: FormSchema[] = [
    {
      label: t('email'),
      field: 'email',
      slot: 'code',
      component: 'Input',
      rules: [{ required: true }],
    },
    {
      label: t('verifyCode'),
      field: 'code',
      component: 'Input',
      rules: [{ required: true }],
    },
    {
      field: 'newPassword',
      component: 'InputPassword',
      label: t('newPassword'),
      required: true,
      colProps: {
        span: 24,
      },
    },
    {
      field: 'newPassword2',
      component: 'InputPassword',
      label: t('newPassword2'),
      required: true,
      colProps: {
        span: 24,
      },
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Divider, Row, Col, CountDown, Button },
    setup() {
      const modelRef = ref({});
      let time = 0;
      const button = computed(() => {
        return time < 1 ? t('send') : `wait ${time} ${t('seconds')}`;
      });
      const [registerForm, { validateFields }] = useForm({
        schemas,

        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const { createErrorModal, createMessage } = useMessage();
      const [register, { closeModal }] = useModalInner();

      async function changePassword() {
        try {
          const data = await validateFields();
          const oldWallet = await useWallet();
          console.log(oldWallet);
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
        } catch (err) {
          createErrorModal({ content: err.message });
        } finally {
          closeModal();
        }
      }
      function getVerifyCode(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          validateFields(['email'])
            .then((email) => {
              console.log(email, 1111);
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        });
        // validateFields('email').then((email) => {
        //   console.log(email);
        // });

        // useApollo()
        //   .mutate({
        //     mutation: sendVerifyCode,
        //     variables: {
        //       email: user.email,
        //       type: 'RESET_PASSWORD',
        //     },
        //   })
        //   .then(() => {
        //     createMessage.success(t('verificationSend'));
        //     time = 60;
        //     setInterval(() => {
        //       if (time < 1) {
        //         time = 0;
        //         clearInterval();
        //         return;
        //       }
        //       time -= 1;
        //     }, 1000);
        //   })
        //   .catch((err) => {
        //     createErrorModal({ content: err });
        //   });
      }
      function forgetPassword() {
        updateSchema({
          field: 'oldPassword',
          rules: [{ required: false }],
        });
      }
      return {
        register,
        registerForm,
        model: modelRef,
        changePassword,
        t,
        getVerifyCode,
        button,
        forgetPassword,
      };
    },
  });
</script>
