<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('changePassword')"
    @ok="changePassword"
  >
    <!--    <Row :gutter="20" type="flex" justify="center">-->
    <!--      <Col :span="8" class="center"-->
    <!--        ><a-button type="link" @click="forgetPassword">{{ t('forget') }}</a-button></Col-->
    <!--      ></Row-->
    <!--    >-->
    <!--    <Divider />-->
    <BasicForm @register="registerForm" :model="model">
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
  import { defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { me, resetPassword } from '/@/hooks/apollo/gqlUser';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useWallet, useNKN, saveWallet } from '/@/hooks/nkn/getNKN';
  import CryptoES from 'crypto-es';
  import { Divider, Row, Col } from 'ant-design-vue';

  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { SendVerifyCode } from '/@/components/NetFile/user';
  import { CountdownInput } from '/@/components/CountDown';

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
    components: { BasicModal, BasicForm, Divider, Row, Col, CountdownInput },
    setup() {
      const modelRef = ref({});
      const [registerForm, { validateFields, appendSchemaByField, updateSchema }] = useForm({
        labelWidth: 180,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const { onResult: GetMe } = useQuery(me);
      GetMe((res) => {
        user.value = res.data.me;
      });
      const user = ref({});

      const { mutate: ResetPassword, onDone } = useMutation(resetPassword);
      const { createErrorModal, createMessage } = useMessage();
      const [register, { closeModal }] = useModalInner();

      async function changePassword() {
        try {
          const data = await validateFields();
          const oldWallet = await useWallet();
          const secret = CryptoES.enc.Base64.stringify(
            CryptoES.HmacSHA512(user.value.email, data.newPassword)
          );
          const NKN = await useNKN();
          let w = new NKN.Wallet({ seed: oldWallet.getSeed(), password: secret });
          const walletJson = JSON.stringify(w.toJSON());
          const res = await ResetPassword({
            email: user.value.email,
            encryptedWallet: walletJson,
            newPassword: data.newPassword,
            oldPassword: data.oldPassword,
            nknPublicKey: w.getPublicKey(),
          });
          saveWallet({ email: user.value.email, password: data.newPassword, walletJson });
          localStorage.setItem('token', res.data?.resetPassword?.token || '');
          createMessage.success(t('changeSuccess'));
        } catch (err) {
          createErrorModal({ content: err.message });
        } finally {
          closeModal();
        }
      }

      async function handleSendCode() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateField(['email']);
        data.type = 'RESET_PASSWORD';
        return await SendVerifyCode({
          email: user.email,
          type: 'RESET_PASSWORD',
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
          componentProps: {
            options: async () => {
              return await getTree();
            },
          },
          rules: [{ required: true }],
        });
      }
      return {
        register,
        registerForm,
        model: modelRef,
        changePassword,
        t,
        forgetPassword,
        handleSendCode,
      };
    },
  });
</script>
