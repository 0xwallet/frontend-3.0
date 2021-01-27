<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('import')" @ok="createFolder">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { driveMakeDir, driveMakeDirUnder } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMutation } from '@vue/apollo-composable';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n('general.metanet');
  const schemas: FormSchema[] = [
    {
      field: 'mode',
      component: 'RadioButtonGroup',
      label: t('type'),
      required: true,
      componentProps: {
        options: [
          { label: 'Hash', value: 'hash', key: 'hash' },
          { label: 'Txid', value: 'txid', key: 'txid' },
        ],
      },
      colProps: {
        span: 24,
      },
      defaultValue: 'basic',
    },
    {
      field: 'hash',
      component: 'Input',
      label: 'Hash',
      required: true,
      ifShow: ({ values }) => {
        return values.mode === 'hash';
      },
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'txid',
      component: 'Input',
      label: 'Txid',
      required: true,
      ifShow: ({ values }) => {
        return values.mode === 'txid';
      },
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal, setModalProps }] = useModalInner();

      const modelRef = ref({});
      const folder = ref({});
      let dirId = '';

      const { createErrorModal } = useMessage();

      const { mutate: MakeDir, onDone } = useMutation(
        dirId === 'root' ? driveMakeDir : driveMakeDirUnder
      );
      onDone(() => {
        closeModal();
      });
      function createFolder() {
        validateFields().then((res) => {
          if (folder.value.find((v) => v.fullName == res.fullName)) {
            createErrorModal({
              title: '错误',
              content: res.fullName + '已存在',
            });
            return;
          }
          res.parentId = dirId;

          MakeDir(res);
        });
      }
      return { register, registerForm, model: modelRef, createFolder, t };
    },
  });
</script>
