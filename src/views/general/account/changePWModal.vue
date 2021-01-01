<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('changePassword')"
    @ok="changePassword"
  >
    <Row :gutter="20" type="flex" justify="center">
      <Col :span="8" class="center"
        ><a-button type="link" @click="forgetPassword">{{ t('forget') }}</a-button></Col
      ></Row
    >
    <Divider />
    <BasicForm @register="registerForm" :model="model">
      <template #code="{ model, field }">
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
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { getMe, useApollo } from '/@/hooks/apollo/apollo';
  import { resetPassword, sendVerifyCode } from '/@/hooks/apollo/gqlUser';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useWallet, useNKN, saveWallet } from '/@/hooks/nkn/getNKN';
  import CryptoES from 'crypto-es';
  import { Divider, Row, Col } from 'ant-design-vue';
  import { CountDown } from '/@/components/CountDown';

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
    components: { BasicModal, BasicForm, Divider, Row, Col, CountDown },
    setup() {
      const modelRef = ref({});
      const emailButton = ref(0);
      const button = computed(() => {
        return emailButton.value < 1 ? t('send') : `wait ${emailButton.value} ${t('seconds')}`;
      });
      const [registerForm, { validateFields, appendSchemaByField, updateSchema }] = useForm({
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
        try {
          const data = await validateFields();
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
        } catch (err) {
          createErrorModal({ content: err.message });
        } finally {
          closeModal();
        }
      }
      async function getVerifyCode() {
        if (emailButton.value > 0) {
          createMessage.error(`wait ${emailButton.value} ${t('seconds')}`);
          return;
        }
        const user = await getMe();
        useApollo()
          .mutate({
            mutation: sendVerifyCode,
            variables: {
              email: user.email,
              type: 'RESET_PASSWORD',
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
      function forgetPassword() {
        updateSchema({
          field: 'oldPassword',
          rules: [{ required: false }],
        });
        appendSchemaByField({
          label: t('verifyCode'),
          field: 'code',
          slot: 'code',
          component: 'Input',
          rules: [{ required: true }],
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
