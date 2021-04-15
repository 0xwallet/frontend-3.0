<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('createFolder')" @ok="createFolder">
    <BasicForm @register="registerForm"> </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Input, Space } from 'ant-design-vue';
  import { NetGql } from '/@/components/NetFile';
  import { useNetFileStore } from '/@/store/modules/netFile';

  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicModal, BasicForm, Input, Space },
    setup() {
      const fileStore = useNetFileStore();
      const pathList = ref([
        { value: '~', id: 'root' },
        { value: '*', id: '' },
      ]);
      const variables = ref({
        dirId: 'root',
      });
      let path = '';
      let rootId = '';
      let parentId = 'root';
      let currentPath = [];
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
            onChange: () => {
              pathList.value = [
                { value: '~', id: 'root' },
                { value: '*', id: '123' },
              ];
            },
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
          ifShow: ({ values }) => {
            return values.mode === 'basic';
          },
          colProps: {
            span: 24,
          },
          defaultValue: '',
        },

        {
          field: 'path',
          component: 'AutoComplete',
          label: t('path'),
          colProps: {
            span: 24,
          },
          helpMessage: ['根目录 ~/', `当前路径 */`],
          componentProps: {
            options: pathList,
            onSelect: (v, option) => {
              fetchData(option);
            },
            onSearch: (v) => {
              switch (v) {
                case '~':
                  variables.value = { dirId: 'root' };
                  break;
              }
            },
            onChange: (v) => {
              if (!v) {
                pathList.value = [
                  { value: '~', id: 'root' },
                  { value: '*', id: '123' },
                ];
              }
              path = v;
            },
          },
          defaultValue: '',
          required: true,
          ifShow: ({ values }) => {
            return values.mode === 'advance';
          },
        },
        {
          field: 'description',
          component: 'Input',
          label: t('desc'),
          colProps: {
            span: 24,
          },
          defaultValue: '',
        },
      ];

      function fetchData(v) {
        rootId = v.id;

        switch (v.value) {
          case '~':
            variables.value = { dirId: 'root' };
            break;
          case '*':
            variables.value = { dirId: parentId };
            break;
          default:
            variables.value = { dirId: v.id };
        }
      }

      const { onResult, refetch } = useQuery(NetGql.Basic.FileList, variables, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult((res) => {
        let list = res.data?.driveListFiles;
        let temp = [];
        if (list) {
          list.slice(2).forEach((v) => {
            if (v.isDir) temp.push({ value: path + '/' + v.fullName.slice(-1)[0], id: v.id });
          });
        }
        pathList.value = temp;
      });
      const [registerForm, { validateFields, resetFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal }] = useModalInner((data) => {
        parentId = data.slice(-1)[0]?.dirId || 'root';
        if (data) {
          currentPath = [];
          data.forEach((v) => {
            currentPath.push(v.name);
          });
        }

        resetFields();
      });

      // function addSchema() {
      //   appendSchemaByField({
      //     field: `path${pathId}`,
      //     component: 'Input',
      //     label: t('path'),
      //     colProps: {
      //       span: 24,
      //     },
      //     helpMessage: ['根目录 ~/', `当前路径 */`],
      //     defaultValue: '',
      //     required: true,
      //     ifShow: ({ values }) => {
      //       return values.mode === 'advance';
      //     },
      //   });
      //   pathId++;
      // }

      const { createErrorModal } = useMessage();

      const { mutate: MakeDir, onDone: MakeDirDone } = useMutation(NetGql.Basic.MakeDir);
      const { mutate: MakeDirUnder, onDone: MakeDirUnderDone } = useMutation(
        NetGql.Basic.MakeDirUnder
      );
      MakeDirDone(() => {
        closeModal();
        fileStore.setRefetch();
      });
      MakeDirUnderDone(() => {
        closeModal();
        fileStore.setRefetch();
      });
      async function createFolder() {
        const data = await validateFields();
        await refetch({ dirId: parentId });
        if (data.mode === 'basic') {
          if (pathList.value.find((v) => v.value.replace('/', '') === data.fullName)) {
            createErrorModal({
              title: '错误',
              content: data.fullName + '已存在',
            });
            return;
          }
          if (parentId === 'root') {
            await MakeDir(data);
          } else {
            await MakeDirUnder({ parentId, ...data });
          }
          return;
        }
        let p = data.path.split('/');
        if (p[0] !== '~' && p[0] !== '*') {
          createErrorModal({
            title: '错误',
            content: '路径格式错误',
          });
          return;
        }
        if (p[0] === '~') {
          p = p.slice(1);
        }
        if (p[0] === '*') {
          p = currentPath.concat(p.filter((v) => v && v.trim()).slice(1));
        }
        await MakeDir({ fullName: p });
      }
      return { register, registerForm, createFolder, t };
    },
  });
</script>
