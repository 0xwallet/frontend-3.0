<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('publishFile')" @ok="updatePublish">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { NetGql } from '/@/components/NetFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      let id = '';
      const treeData = ref([]);
      const { createErrorModal, createMessage } = useMessage();
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas: [
          {
            field: 'id',
            label: 'Publish ID',
            component: 'TreeSelect',
            componentProps: {
              treeData: treeData,
              loadData: (treeNode) => {
                return new Promise((resolve) => {
                  const { value } = treeNode.dataRef;
                  refetch({ dirId: value }).then((res) => {
                    const data = res.data.driveListFiles;
                    treeNode.dataRef.children = getTreeData(data.slice(2));
                  });
                  resolve();
                });
              },
            },
          },
        ],
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal }] = useModalInner((data) => {
        id = data.publishId;
        refetch().then((res) => {
          const list = res.data.driveListFiles;
          treeData.value = getTreeData(list);
        });
      });
      const { refetch } = useQuery(NetGql.Basic.FileList, null, () => ({
        fetchPolicy: 'network-only',
      }));
      const { mutate: UpdatePublishFile } = useMutation(NetGql.Publish.Update);
      function getTreeData(data: any[]): any[] {
        let folder: any[] = [];
        let file: any[] = [];

        if (data.length === 0) return [];
        data.forEach((v, i) => {
          if (i === 0 || v === null || v.id === 'root') return;

          if (v.isDir) {
            folder.push({
              value: v.id,
              label: v.fullName.slice(-1)[0],
              isLeaf: !v.isDir,
              selectable: false,
            });
          } else {
            file.push({ value: v.id, label: v.fullName.slice(-1)[0], isLeaf: !v.isDir });
          }
        });
        return folder.concat(file);
      }

      async function updatePublish() {
        try {
          const data = await validateFields();
          await UpdatePublishFile({ userFileId: data.id, id });
          createMessage.success(t('publishSuccess'));
        } catch (e) {
          createErrorModal({ content: e });
        } finally {
          closeModal();
        }
      }

      return { register, t, registerForm, updatePublish };
    },
  });
</script>
