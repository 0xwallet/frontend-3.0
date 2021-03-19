<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('addApp')">
    <BasicForm @register="registerForm" layout="vertical" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { me } from '/@/hooks/apollo/gqlUser';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Divider, Row, Col } from 'ant-design-vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { CountdownInput } from '/@/components/CountDown';

  const { t } = useI18n('general.account');

  export default defineComponent({
    components: { BasicModal, BasicForm, Divider, Row, Col, CountdownInput },
    setup() {
      const [registerForm, { setProps }] = useForm({
        schemas: [
          {
            field: 'name',
            component: 'Input',
            label: t('name'),
            colProps: {
              span: 24,
            },
          },
          {
            field: 'number',
            component: 'Input',
            label: t('cardNumber'),
            colProps: {
              span: 24,
            },
          },
          {
            field: 'month',
            component: 'Input',
            label: t('month'),
            colProps: {
              span: 7,
            },
          },
          {
            field: 'year',
            component: 'Input',
            label: t('year'),
            colProps: {
              span: 7,
              offset: 1,
            },
          },
          {
            field: 'cvc',
            component: 'Input',
            label: 'CVV/CVC',
            colProps: {
              span: 7,
              offset: 1,
            },
          },
        ],
        showActionButtonGroup: false,
        compact: false,
      });

      const { onResult: GetMe } = useQuery(me);
      GetMe((res) => {
        user.value = res.data.me;
      });
      const user = ref({});

      const [register, { closeModal, setModalProps }] = useModalInner(() => {});

      return {
        register,
        registerForm,
        t,
      };
    },
  });
</script>
