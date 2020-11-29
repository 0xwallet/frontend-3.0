<template>
  <BasicModal v-bind="$attrs" @register="register" title="移动文件" @ok="moveFile">
    <Row
      ><Col>选择了{{ total }}个文件,已处理{{ now }}个</Col
      ><Col><Progress :percent="total === 0 ? 0 : (now / total) * 100" /></Col
    ></Row>
    <Tree :treeData="treeData" :loadData="onLoadData" v-model:selectedKeys="path" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Tree, Progress, Row, Col } from 'ant-design-vue';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListFiles, driveMoveFile } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { TreeItem } from '/@/components/Tree/index';
  export default defineComponent({
    components: { BasicModal, Tree, Progress, Row, Col },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      let folder: string[] = [];
      const total = ref(0);
      const now = ref(0);
      const path = ref([]);
      const treeData = ref([{ title: '根目录', key: 'root', value: 'root' }] as TreeItem[]);
      const [register] = useModalInner((data) => {
        folder = data.folder;
        total.value = data.folder.length;
        path.value = [data.path[data.path.length - 1]];
      });

      function onLoadData(treeNode) {
        if (treeNode.dataRef.children) {
          return;
        }
        return useApollo()
          .query({
            query: driveListFiles,
            variables: { dirId: treeNode.value },
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            let temp: TreeItem[] = [];
            if (!res.data.driveListFiles) {
              return;
            }
            res.data.driveListFiles.forEach((v, index) => {
              if (index < 2) {
                return;
              }
              if (v && v.isDir && v.id !== 'root' && v.id != treeNode.value) {
                temp.push({ title: v.fullName[v.fullName.length - 1], key: v.id, value: v.id });
              }
            });
            treeNode.dataRef.children = temp;
          });
      }
      async function moveFile() {
        try {
          now.value = 0;
          for (let i = 0; i < folder.length; i++) {
            if (folder[i] != path.value[0]) {
              await useApollo().mutate({
                mutation: driveMoveFile,
                variables: {
                  fromId: folder[i],
                  toId: path.value[0],
                },
              });
              now.value += 1;
            }
          }

          //
        } catch (err) {
          console.log(err);
          createErrorModal({ title: '错误', content: err.message });
        } finally {
          createMessage.success('成功移动' + now.value + '个文件');
        }
      }
      return { register, treeData, onLoadData, moveFile, path, total, now };
    },
  });
</script>
