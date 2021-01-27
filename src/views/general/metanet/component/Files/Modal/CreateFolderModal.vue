<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('createFile')" @ok="createFolder">
    <BasicForm @register="registerForm" :model="model">
      <template #path="{ model, field }">
        <Space
          ><Input v-model:value="model[field]" /><a-button @click="addSchema">+</a-button></Space
        >
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalContext, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { driveMakeDir, driveMakeDirUnder } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMutation } from '@vue/apollo-composable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Input, Space } from 'ant-design-vue';

  const { t } = useI18n('general.metanet');
  const schemas: FormSchema[] = [
    {
      field: 'mode',
      component: 'RadioButtonGroup',
      label: t('type'),
      required: true,
      componentProps: {
        options: [
          { label: 'Basic', value: 'basic', key: 'basic' },
          { label: 'Advance', value: 'advance', key: 'advance' },
        ],
      },
      colProps: {
        span: 24,
      },
      defaultValue: 'basic',
    },
    {
      field: 'fullName',
      component: 'Input',
      label: t('folderName'),
      required: true,
      show: ({ values }) => {
        return values.mode === 'basic';
      },
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
      show: ({ values }) => {
        return values.mode === 'basic';
      },
    },
    {
      field: 'path',
      component: 'Input',
      label: t('path'),
      colProps: {
        span: 24,
      },
      helpMessage: ['根目录 ~/', `当前路径 */`],
      defaultValue: '',
      slot: 'path',
      required: true,
      show: ({ values }) => {
        return values.mode === 'advance';
      },
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Input, Space },
    setup() {
      const [registerForm, { validateFields, appendSchemaByField }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal, setModalProps }] = useModalInner((data) => {
        dirId = data.dirId;
        folder.value = data.folder;
      });

      let pathId = 0;

      function addSchema() {
        appendSchemaByField({
          field: `path${pathId}`,
          component: 'Input',
          label: t('path'),
          colProps: {
            span: 24,
          },
          helpMessage: ['根目录 ~/', `当前路径 */`],
          defaultValue: '',
          required: true,
          show: ({ values }) => {
            return values.mode === 'advance';
          },
        });
        pathId++;
      }

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
      return { register, addSchema, registerForm, model: modelRef, createFolder, t };
    },
  });
</script>
