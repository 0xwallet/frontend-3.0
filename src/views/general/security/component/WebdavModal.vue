<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('addApp')" @ok="addWebdav">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useForm, BasicForm } from '/@/components/Form';

  const { t } = useI18n('general.security');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const [register] = useModalInner();

      const [registerForm] = useForm({
        schemas: [
          {
            field: 'name',
            label: t('appName'),
            component: 'Input',
            required: true,
            colProps: { span: 24 },
          },
          {
            field: 'password',
            label: t('appPassword'),
            component: 'InputPassword',
            required: true,
            colProps: { span: 24 },
          },
        ],
        showActionButtonGroup: false,
      });
      function addWebdav() {}
      return { register, registerForm, t, addWebdav };
    },
  });
</script>
