<template>
  <BasicModal v-bind="$attrs" @register="register" title="新建文件夹" @ok="createFolder">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveMakeDir, driveMakeDirUnder } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { da } from '../../../../dist/_assets/index.1e456ede';
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      component: 'Input',
      label: '文件夹名',
      required: true,
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
          console.log(res);
          useApollo()
            .mutate({ mutation: dirId === '' ? driveMakeDir : driveMakeDirUnder, variables: res })
            .then((r) => {})
            .finally(() => {
              closeModal();
            });
        });
      }
      return { register, schemas, registerForm, model: modelRef, createFolder };
    },
  });
</script>
