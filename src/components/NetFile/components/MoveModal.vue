<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('moveFile')" @ok="moveFile">
    <Row
      ><Col>{{ t('select') }} {{ total }} {{ t('file') }},{{ t('processed') }} {{ now }} </Col
      ><Col><Progress :percent="total === 0 ? 0 : (now / total) * 100" /></Col
    ></Row>
    <Tree :treeData="treeData" :loadData="onLoadData" v-model:selectedKeys="path" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Tree, Progress, Row, Col } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { TreeItem } from '/@/components/Tree';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { NetGql } from '/@/components/NetFile';
  import { useNetFileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, Tree, Progress, Row, Col },
    setup() {
      const fileStore = useNetFileStore();
      const { createMessage, createErrorModal } = useMessage();
      let folder: string[] = [];
      const total = ref(0);
      const now = ref(0);
      const path = ref([]);
      const treeData = ref([{ title: '根目录', key: 'root', value: 'root' }] as TreeItem[]);
      const [register, { closeModal }] = useModalInner((data) => {
        folder = data.folder.filter((v) => v && v.trim());
        console.log(folder);
        total.value = data.folder.length;
        path.value = [data.path[data.path.length - 1]];
      });
      const { mutate: MoveFile } = useMutation(NetGql.Basic.Move);
      const variables = ref({});
      const { onResult } = useQuery(NetGql.Basic.FileList, variables);

      let tree = null;

      onResult((res) => {
        if (!tree) return;
        const list = res.data.driveListFiles;
        let temp: TreeItem[] = [];
        if (!list) {
          return;
        }
        list.forEach((v, index) => {
          if (index < 2) {
            return;
          }
          if (v && v.isDir && v.id !== 'root' && v.id != tree.value && !folder.includes(v.id)) {
            temp.push({ title: v.fullName[v.fullName.length - 1], key: v.id, value: v.id });
          }
        });
        tree.dataRef.children = temp;
      });
      async function onLoadData(treeNode) {
        if (treeNode.dataRef.children) {
          return;
        }
        tree = treeNode;
        variables.value = { dirId: treeNode.value };
      }
      async function moveFile() {
        try {
          now.value = 0;
          for (let i = 0; i < folder.length; i++) {
            if (folder[i] != path.value[0]) {
              await MoveFile({
                fromId: folder[i],
                toId: path.value[0],
                fromSpace: 'PRIVATE',
                toSpace: 'PRIVATE',
              });
              now.value += 1;
            }
          }

          //
        } catch (err) {
          console.log(err);
          createErrorModal({ title: t('error'), content: err.message });
        } finally {
          fileStore.setRefetch();
          createMessage.success(`${t('success')} ${t('moveButton')}` + now.value + t('file'));
          closeModal();
        }
      }
      return { register, treeData, onLoadData, moveFile, path, total, now, t };
    },
  });
</script>
