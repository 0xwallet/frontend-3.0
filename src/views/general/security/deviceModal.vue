<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="bindDevice">
    <Divider />
    <BasicForm @register="registerForm" layout="vertical">
      <template #publicKey="{ model, field }">
        <InputSearch
          v-model:value="model[field]"
          placeholder="input Public Key"
          @search="getVerifyCode"
        >
          <template #enterButton>
            <a-button type="primary"> {{ button }}</a-button>
          </template>
        </InputSearch>
      </template>
    </BasicForm>
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
      slot: 'publicKey',
      rules: [{ required: true }],
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, InputSearch: Input.Search, Divider },
    setup() {
      const publicKey = ref('');
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

        if (emailButton.value > 0) {
          createMessage.error(`wait ${emailButton.value} ${t('seconds')}`);
          return;
        }
        const params = await validate();
        console.log(params);

        useApollo()
          .mutate({
            mutation: sendVerifyCode,
            variables: {
              nkn: params.publicKey,
              type: 'active_nkn',
            },
          })
          .then((res) => {
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
            console.log(res);
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
