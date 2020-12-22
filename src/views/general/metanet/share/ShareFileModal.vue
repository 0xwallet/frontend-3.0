<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="pushCode">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  const schemas: FormSchema[] = [
    {
      field: 'code',
      component: 'Input',
      label: t('code'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup(_, { emit }) {
      const modelRef = ref({});
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,

        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const [register, { setModalProps }] = useModalInner(() => {
        console.log(t('file'));
        setModalProps({
          title: t('file'),
          maskClosable: false,
          // closable: false,
          canFullscreen: false,
          showCancelBtn: false,
        });
      });

      async function pushCode() {
        const data = await validateFields();
        emit('pushCode', data);
      }

      return { register, registerForm, model: modelRef, pushCode };
    },
  });
</script>
