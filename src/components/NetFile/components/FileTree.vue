<template>
  <div class="scroll-wrap">
    <BasicTree
      :treeData="treeData"
      ref="treeRef"
      :loadData="onLoadData"
      :showIcon="true"
      @select="select"
      search
      v-if="show"
      ><template #headerTitle
        ><Button @click="changeOutline" type="link"
          ><Icon :icon="'fa-solid:list-ol'" v-if="treeVisible" /></Button
      ></template>
    </BasicTree>
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
  import { useNetFileStore } from '/@/store/modules/netFile';
  import { Button } from '/@/components/Button';
  import { Icon } from '/@/components/Icon';

  export default defineComponent({
    components: { BasicTree, Button, Icon },
    props: {
      path: propTypes.object,
      filters: propTypes.array.def([]),
    },
    setup(props) {
      const fileStore = useNetFileStore();
      const treeRef = ref<Nullable<TreeActionType>>(null);
      const height = computed(() => document.body.clientHeight - 500);
      const { createMessage } = useMessage();
      const show = ref(true);
      const treeData = ref<TreeDataItem[]>([]);
      watch(
        () => props.path,
        (v) => {
          console.log(treeData.value);
          show.value = false;
          if (treeData.value.length > 0 && treeData.value[0].value == v.dirId) return;
          treeData.value = [
            {
              title: v.name,
              value: v.dirId,
              key: v.dirId,
              icon: 'bx-bx-folder',
            },
          ];
          setTimeout(() => {
            show.value = true;
          }, 50);
        },
        { immediate: true }
      );
      const treeVisible = computed(() => {
        return !fileStore.getEditorOutlineVisible;
      });
      const dirId = computed(() => props.path);

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
        if (props.filters.includes(node.value.type)) {
          fileStore.appendMarkdownFile(node.value, false);
        }
      }
      function changeOutline() {
        fileStore.setEditorOutlineVisible();
      }

      return {
        treeData,
        treeRef,
        onLoadData,
        select,
        height,
        changeOutline,
        treeVisible,
        show,
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
