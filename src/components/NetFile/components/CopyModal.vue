<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('copyButton')" @ok="copyFile">
    <!--    <Row-->
    <!--      ><Col>{{ t('select') }} {{ total }} {{ t('file') }},{{ t('processed') }} {{ now }} </Col-->
    <!--      ><Col><Progress :percent="total === 0 ? 0 : (now / total) * 100" /></Col-->
    <!--    ></Row>-->
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
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, Tree, Progress, Row, Col },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      let file = ref('');
      const path = ref([]);
      const treeData = ref([{ title: '根目录', key: 'root', value: 'root' }] as TreeItem[]);
      const [register, { closeModal }] = useModalInner((data) => {
        file.value = data.id;
      });
      const variables = ref({});
      const { onResult } = useQuery(NetGql.Basic.FileList, variables);
      const { mutate: CopyFile } = useMutation(NetGql.Basic.Copy);
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
          if (v && v.isDir && v.id !== 'root' && v.id != tree.value) {
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
      async function copyFile() {
        try {
          if (path.value.length == 0) {
            return;
          }
          await CopyFile({
            fromId: file.value,
            toId: path.value[0],
          });

          //
        } catch (err) {
          console.log(err);
          createErrorModal({ title: t('error'), content: err.message });
        } finally {
          createMessage.success(`${t('success')} ${t('copyButton')}`);
          closeModal();
        }
      }
      return { register, treeData, onLoadData, copyFile, path, t };
    },
  });
</script>
