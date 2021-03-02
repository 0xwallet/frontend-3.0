<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('markdownTitle')"
    :minHeight="height"
    width="80%"
    :closeFunc="handleCloseFunc"
  >
    <Tabs v-model:activeKey="activeKey" hide-add type="editable-card" @edit="onEdit">
      <TabPane
        v-for="(pane, index) in panes"
        :key="pane.key"
        :tab="pane.title"
        :closable="pane.closable"
      >
        <div :ref="setRef(index)" :id="pane.key"></div>
      </TabPane>
    </Tabs>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, createVNode, defineComponent, nextTick, ref, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { Tabs, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { fileStore } from '/@/store/modules/netFile';
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';

  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicModal, Tabs, TabPane: Tabs.TabPane },
    setup() {
      const refs = ref<HTMLElement[]>([]);
      const setRef = (index: number) => (el: HTMLElement) => {
        refs.value[index] = el;
      };
      const panes = ref([]);
      const activeKey = ref('');
      const vditorRef = ref<Nullable<Vditor>>(null);
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

      const [register, { setModalProps, closeModal }] = useModalInner((data) => {
        // const f: NetFile = data;
        // setModalProps({
        //   loading: true,
        //   okText: t('saveButton'),
        //   title: f.fileName(),
        // });
        //
        // const value = await f.raw();
        // valueRef.value = value;
      });
      async function init(index: number) {
        const value = await panes.value[index].file.raw();
        const wrapEl = refs.value[index];
        if (!wrapEl) return;
        vditorRef.value = new Vditor(wrapEl, {
          lang: 'zh_CN',
          value,
          mode: 'ir',
          preview: {
            actions: [],
          },
          cache: {
            enable: false,
          },
          height: height.value,
          input: () => {
            edited.value = true;
          },
        });
        // initedRef.value = true;
      }
      const edited = ref(false);
      async function handleCloseFunc() {
        if (!edited.value) return true;
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

      const onEdit = (targetKey: string) => {
        console.log(targetKey);
      };

      return {
        handleCloseFunc,
        register,
        t,
        height,
        activeKey,
        panes,
        onEdit,
        setRef,
      };
    },
  });
</script>
