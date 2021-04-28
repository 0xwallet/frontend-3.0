<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('rename')" @ok="rename">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation } from '@vue/apollo-composable';
  import { useForm, BasicForm } from '/@/components/Form';
  import { NetFile, NetGql } from '/@/components/NetFile';
  import { useNetFileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const fileStore = useNetFileStore();
      const id = ref('');
      const space = ref('');
      const { createMessage, createErrorModal } = useMessage();
      const [register, { closeModal }] = useModalInner((data) => {
        const { file }: NetFile = data;
        id.value = file.id;
        space.value = file.space.space;
        setFieldsValue({ newName: file.fileName() });
      });

      const { mutate: RenameFile } = useMutation(NetGql.Basic.Rename);
      const [registerForm, { validateFields, setFieldsValue }] = useForm({
        schemas: [
          {
            field: 'newName',
            component: 'Input',
            defaultValue: '',
            label: t('fileName'),
            required: true,
          },
        ],
        labelWidth: 150,
        showActionButtonGroup: false,
      });

      async function rename() {
        try {
          const data = await validateFields();
          data.space = space.value;
          data.id = id.value;
          await RenameFile(data);
        } catch (err) {
          console.log(err);
          createErrorModal({ title: t('error'), content: err.message });
        } finally {
          createMessage.success(`${t('success')} ${t('rename')}`);
          fileStore.setRefetch();
          closeModal();
        }
      }
      return { register, t, registerForm, rename };
    },
  });
</script>
