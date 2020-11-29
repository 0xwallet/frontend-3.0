<template>
  <BasicModal v-bind="$attrs" @register="register">
    <BasicForm @register="registerForm" layout="vertical" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  const schemas: FormSchema[] = [
    {
      field: 'code',
      component: 'Input',
      label: 'code',
      colProps: {
        span: 24,
      },
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const [registerForm] = useForm({
        schemas,
        showActionButtonGroup: false,
        compact: false,
      });
      const [register] = useModalInner((data) => {});

      return { register, registerForm };
    },
  });
</script>
