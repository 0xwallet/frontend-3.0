<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('createFile')" @ok="createFolder">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { driveMakeDir, driveMakeDirUnder } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMutation } from '@vue/apollo-composable';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  const schemas: FormSchema[] = [
    {
      field: 'type',
      component: 'RadioButtonGroup',
      label: t('type'),
      required: true,
      componentProps: {
        options: [
          { label: 'Txt', value: 'txt', key: 'txt' },
          { label: 'Markdown', value: 'md', key: 'md' },
        ],
      },
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'fullName',
      component: 'Input',
      label: t('fileName'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'desc',
      component: 'Input',
      label: t('desc'),
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const modelRef = ref({});
      const folder = ref({});
      let dirId = '';
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const { createErrorModal } = useMessage();

      const [register, { closeModal }] = useModalInner((data) => {
        dirId = data.dirId;
        folder.value = data.folder;
      });

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
      return { register, schemas, registerForm, model: modelRef, createFolder, t };
    },
  });
</script>
