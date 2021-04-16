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
      <div class="flex-none w-1/5 m-1" v-if="treeVisible">
        <FileTree :filters="['md', 'txt', 'json']" :path="path" />
        <div class="grid grid-cols-3 gap-1">
          <div
            ><Button @click="newMarkdown" type="link"><Icon :icon="`fa:plus`" /></Button>
          </div>
          <div>{{ path.name }}</div>
          <div
            ><Button type="link"><Icon :icon="`fa:list`" /></Button
          ></div>
        </div>
      </div>
      <div v-if="!treeVisible" class="w-10 m-1">
        <Button @click="changeOutline" type="link"
          ><Icon :icon="'clarity:tree-view-line'"
        /></Button>
      </div>
      <div class="flex-grow">
        <Tabs v-model:activeKey="activeKey" hide-add type="editable-card" @edit="onEdit">
          <TabPane v-for="(pane, index) in panes" :key="pane.key" :closable="pane.closable">
            <template #tab>
              <div>
                <EditOutlined v-if="pane.edited" @click="save(index)" />
                <TypographyText
                  :content="pane.title"
                  :ellipsis="{ tooltip: `${pane.title}` }"
                  :style="{ width: '80px' }"
                />
                <span v-if="pane.title.length > 10">{{ pane.title.split('.').slice(-1)[0] }}</span>
              </div>
            </template>
            <Spin :spinning="pane.waiting">
              <div :ref="setRef(index)" :id="pane.key" />
            </Spin>
          </TabPane> </Tabs
      ></div>
    </div>
    <NewMarkdownModal @register="registerNewMarkdownModal" centered />
  </BasicModal>
</template>
<script lang="ts">
  import { computed, createVNode, defineComponent, nextTick, ref, watch } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tabs, Modal, Spin, Typography } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { markdownFile, useNetFileStore } from '/@/store/modules/netFile';
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';
  import { FileTree } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { EditOutlined } from '@ant-design/icons-vue';
  import NewMarkdownModal from './NewMarkdownModal.vue';
  import { Icon } from '/@/components/Icon';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: {
      BasicModal,
      Tabs,
      TabPane: Tabs.TabPane,
      FileTree,
      Button,
      EditOutlined,
      Spin,
      NewMarkdownModal,
      Icon,
      TypographyText: Typography.Text,
    },
    setup() {
      const fileStore = useNetFileStore();
      const { createMessage } = useMessage();
      const refs = ref<HTMLElement[]>([]);
      const setRef = (index: number) => (el: HTMLElement) => {
        refs.value[index] = el;
      };
      const vditorRefs = ref<Nullable<Vditor>[]>([]);
      const panes = ref<markdownFile[]>([]);
      const activeKey = ref('');
      const visible = computed(() => fileStore.getEditorVisible);
      const spinning = ref(true);
      const treeVisible = computed(() => {
        openOutLine();
        return !fileStore.getEditorOutlineVisible;
      });
      const path = computed(() => fileStore.getEditorPath);
      watch(
        () => fileStore.getWaitingList,
        (v) => {
          console.log(v);
        },
        { deep: true }
      );
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

      const [registerNewMarkdownModal, { openModal }] = useModal();

      const height = computed(() => document.body.clientHeight - 300);
      const [register, { closeModal }] = useModalInner();
      async function init(index: number) {
        try {
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
              fileStore.setMarkdownEdited(index, true);
            },
            outline: { enable: false },
          });

          vditorRefs.value.push(vditor);

          if (panes.value[index].content === undefined) {
            const value = await panes.value[index].file.raw();
            vditor.setValue(value);
            fileStore.setWaiting(index, false);
          }

          // console.log((a[0].style.display = 'block'));

          // initedRef.value = true;
        } finally {
        }
      }

      function openOutLine(open: boolean) {
        const status = !fileStore.getEditorOutlineVisible ? 'none' : 'block';
        const list = document.getElementsByClassName('vditor-outline');
        // console.log(list.length);
        for (let i = 0; i < list.length; i++) {
          list[i].style.display = status;
        }
        // document
        //   .getElementsByClassName('vditor-outline')
        //   .forEach((v) => (v.style.display = status));
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
        if (!panes.value[index].file) {
          openModal(true, { index, content: vditor.getValue() });
          return;
        }

        try {
          const vditor = vditorRefs.value[index];
          if (!vditor) return;

          await fileStore.editFile(vditor.getValue(), panes.value[index].key, index);
        } finally {
        }
      }
      function visibleChange(v) {
        fileStore.setEditorVisible(v);
      }
      function changeOutline() {
        fileStore.setEditorOutlineVisible();
      }
      function newMarkdown() {
        fileStore.createMarkdownFile();
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
        spinning,
        treeVisible,
        changeOutline,
        newMarkdown,
        registerNewMarkdownModal,
      };
    },
  });
</script>
