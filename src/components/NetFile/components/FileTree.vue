<template>
  <div class="scroll-wrap">
    <BasicTree
      :treeData="treeData"
      :title="'文件夹'"
      ref="treeRef"
      :loadData="onLoadData"
      :showIcon="true"
      @select="select"
      search
    ></BasicTree>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref, watch } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { propTypes } from '/@/utils/propTypes';
  import { NetFile, NetGql } from '/@/components/NetFile';
  import type { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { fileStore } from '/@/store/modules/netFile';
  export default defineComponent({
    components: { BasicTree },
    props: {
      path: propTypes.string.def('root'),
      filters: propTypes.array.def([]),
    },
    setup(props) {
      const treeRef = ref<Nullable<TreeActionType>>(null);
      const height = computed(() => document.body.clientHeight - 500);
      const { createMessage } = useMessage();
      watch(
        () => props.path,
        (v) => {
          console.log(v);
        },
        { immediate: true }
      );
      const dirId = computed(() => props.path);
      const treeData: TreeDataItem[] = [
        {
          title: '~',
          value: 'root',
          key: 'root',
          icon: 'bx-bx-folder',
        },
      ];
      function fetchData(variables: { dirId: string }, parentKey?: string) {
        console.log(parentKey, variables);
        useApollo({
          mode: 'query',
          gql: NetGql.Basic.FileList,
          variables,
        }).then((res) => {
          const data = res.data?.driveListFiles;
          let files: TreeDataItem[] = [];

          data.slice(2).forEach((v) => {
            if (v.isDir) {
              getTree().insertNodeByKey({
                parentKey,
                node: {
                  key: v.id,
                  value: v.id,
                  title: v.fullName.slice(-1)[0],
                  icon: 'bx-bx-folder',
                },
              });
            } else {
              if (!props.filters.includes(v.fullName.slice(-1)[0].split('.').slice(-1)[0])) return;
              files.push({
                key: v.id,
                value: new NetFile({ userFile: v }),
                title: v.fullName.slice(-1)[0],
                isLeaf: true,
                icon: 'bx-bx-file-blank',
              });
            }
          });
          files.forEach((node) => {
            getTree().insertNodeByKey({
              parentKey,
              node,
            });
          });
        });
      }

      function getTree() {
        const tree = unref(treeRef);
        if (!tree) {
          throw new Error('tree is null!');
        }
        return tree;
      }

      async function onLoadData(treeNode) {
        fetchData({ dirId: treeNode.value }, treeNode.value);
      }
      function select(selectedKeys, { node }) {
        console.log(node.value);
        if (node.value.type === 'md') {
          fileStore.appendMarkdownFile(node.value);
        }
      }

      return {
        treeData,
        treeRef,
        onLoadData,
        select,
        height,
      };
    },
  });
</script>
<style lang="less" scoped>
  .scroll-wrap {
    height: 75vh;
    background: #fff;
  }
</style>
