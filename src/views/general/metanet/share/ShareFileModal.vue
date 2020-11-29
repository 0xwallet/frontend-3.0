<template>
  <BasicModal v-bind="$attrs" @register="register" title="查看分享" @ok="pushCode">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';

  const schemas: FormSchema[] = [
    {
      field: 'code',
      component: 'Input',
      label: '分享码',
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

      const [register, { closeModal }] = useModalInner();

      async function pushCode() {
        const data = await validateFields();
        emit('pushCode', data);
      }

      return { register, registerForm, model: modelRef, pushCode };
    },
  });
</script>
