<template>
  <BasicModal v-bind="$attrs" @register="register" title="新建文件夹">
    <BasicTree :treeData="treeData" :loadData="onLoadData" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTree, TreeItem } from '/@/components/Tree/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListFiles, driveMakeDir, driveMakeDirUnder } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  export const treeData: TreeItem[] = [
    {
      title: 'parent 1',
      key: '0-0',
      icon: 'home|svg',
    },
    {
      title: 'parent 2',
      key: '1-1',
      icon: 'home|svg',
    },
    {
      title: 'parent 3',
      key: '2-2',
      icon: 'home|svg',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicTree },
    setup() {
      const { createErrorModal } = useMessage();

      const [register, { closeModal }] = useModalInner((data) => {
        console.log(data);
      });
      function fetchData(params) {
        useApollo()
          .query({
            query: driveListFiles,
            variables: params,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            console.log(res);
          });
      }
      function onLoadData(treeNode) {
        console.log(treeNode);
        return new Promise((resolve) => {
          console.log(treeNode);
          if (treeNode.dataRef.children) {
            resolve();
            return;
          }
          setTimeout(() => {
            treeNode.dataRef.children = [
              { title: 'Child Node', key: `${treeNode.eventKey}-0` },
              { title: 'Child Node', key: `${treeNode.eventKey}-1` },
            ];
            resolve();
          }, 1000);
        });
      }

      return { register, treeData, onLoadData };
    },
  });
</script>
