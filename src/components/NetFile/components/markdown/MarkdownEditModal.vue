<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :minHeight="height"
    width="80%"
    :visible="visible"
    :closeFunc="handleCloseFunc"
    :footer="null"
    @visibleChange="visibleChange"
  >
    <template #title></template>

    <div class="flex">
      <div class="flex-none w-1/5 m-1">
        <FileTree :filters="['md', 'txt']" :path="path.dirId" />
        <div class="grid grid-cols-3 gap-1">
          <div>1</div>
          <div>{{ path.title }}</div>
          <div>3</div>
        </div>
      </div>
      <div class="flex-grow">
        <Tabs v-model:activeKey="activeKey" hide-add type="editable-card" @edit="onEdit">
          <TabPane v-for="(pane, index) in panes" :key="pane.key" :closable="pane.closable">
            <template #tab
              ><EditOutlined v-if="pane.edited" @click="save(index)" />{{ pane.title }}</template
            >
            <div :ref="setRef(index)" :id="pane.key" />
          </TabPane> </Tabs
      ></div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, createVNode, defineComponent, nextTick, ref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tabs, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { fileStore, markdownFile } from '/@/store/modules/netFile';
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';
  import { FileTree } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { EditOutlined } from '@ant-design/icons-vue';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicModal, Tabs, TabPane: Tabs.TabPane, FileTree, Button, EditOutlined },
    setup() {
      const { createMessage } = useMessage();
      const refs = ref<HTMLElement[]>([]);
      const setRef = (index: number) => (el: HTMLElement) => {
        refs.value[index] = el;
      };
      const vditorRefs = ref<Nullable<Vditor>[]>([]);
      const panes = ref<markdownFile[]>([]);
      const activeKey = ref('');
      const path = ref({ dirId: 'root', title: 'Home' });
      const visible = computed(() => fileStore.getEditorVisible);

      // const vditorRef = ref<Nullable<Vditor>>(null);
      watch(
        () => fileStore.getMarkdownFiles,
        (v) => {
          panes.value = v;
          activeKey.value = v.slice(-1)[0]?.key || '';
          nextTick(() => {
            init(v.length - 1);
          });
        },
        { deep: true }
      );

      const height = computed(() => document.body.clientHeight - 300);
      const text = ref(false);
      const [register, { closeModal }] = useModalInner();
      async function init(index: number) {
        if (vditorRefs.value[index]) return;

        const wrapEl = refs.value[index];
        if (!wrapEl) return;
        let vditor = new Vditor(wrapEl, {
          lang: 'zh_CN',
          value: '',
          mode: 'ir',
          preview: {
            actions: [],
          },
          cache: {
            enable: false,
          },
          height: height.value - 70,
          input: () => {
            fileStore.setMarkdownEdited({ index, v: true });
          },
          outline: { enable: false },
        });

        vditorRefs.value.push(vditor);
        const value = await panes.value[index].file.raw();
        vditor.setValue(value);
        openOutLine(index, true);
        // console.log((a[0].style.display = 'block'));
        console.log(a);
        // initedRef.value = true;
      }

      function openOutLine(index: number, open: boolean) {
        document.getElementsByClassName('vditor-outline')[index].style.display = open
          ? 'block'
          : 'none';
      }

      function handleCloseFunc() {
        if (fileStore.getMarkdownFiles.some((v) => v.edited)) {
          Modal.confirm({
            title: t('error'),
            icon: createVNode(ExclamationCircleOutlined),
            content: '文件内容有变化，不保存吗?',
            centered: true,
            okText: t('yes'),
            cancelText: t('cancelAll'),
            onOk() {
              closeModal();
            },
          });
          return false;
        }

        return true;
      }

      const onEdit = async (targetKey: string) => {
        const index = await fileStore.delMarkdownFile(targetKey);
        refs.value.splice(index, 1);
        vditorRefs.value.splice(index, 1);
      };
      async function save(index) {
        const vditor = vditorRefs.value[index];
        if (!vditor) return;
        await fileStore.editFile({ content: vditor.getValue(), id: panes.value[index].key });
        fileStore.setMarkdownEdited({ index, v: false });
        createMessage.success('保存成功');
      }
      function visibleChange(v) {
        fileStore.setEditorVisible(v);
      }
      return {
        handleCloseFunc,
        register,
        t,
        height,
        activeKey,
        panes,
        onEdit,
        setRef,
        save,
        path,
        visible,
        visibleChange,
      };
    },
  });
</script>
