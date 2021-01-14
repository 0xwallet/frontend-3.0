<template>
  <BasicModal v-bind="$attrs" @register="register" title="新建文件夹" @ok="createFolder">
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
      return { register, schemas, registerForm, model: modelRef, createFolder };
    },
  });
</script>
