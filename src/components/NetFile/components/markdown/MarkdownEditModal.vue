<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('markdownTitle')"
    :minHeight="height"
    width="80%"
    destroyOnClose
    :closeFunc="handleCloseFunc"
  >
    <Tabs v-model:activeKey="activeKey" hide-add type="editable-card" @edit="onEdit">
      <TabPane
        v-for="(pane, index) in panes"
        :key="pane.key"
        :tab="pane.title"
        :closable="pane.closable"
      >
        {{ index }}
        {{ pane }}
        <!--        <Vditor :file="pane.file" />-->
        <div :ref="setRef(index)" :id="pane.id"></div>
        <!--        {{ pane.ref }}-->
      </TabPane>
    </Tabs>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, createVNode, defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');
  import { Tabs, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import Vditor from './Vditor.vue';
  import { fileStore } from '/@/store/modules/netFile';

  export default defineComponent({
    components: { BasicModal, Tabs, TabPane: Tabs.TabPane, Vditor },
    setup() {
      const panes = computed(() => {
        activeKey.value = fileStore.getMarkdownFiles.slice(-1)[0].key;
        return fileStore.getMarkdownFiles;
      });
      const activeKey = ref('');
      const height = computed(() => document.body.clientHeight - 300);

      const [register, { setModalProps, closeModal }] = useModalInner(async (data) => {
        // const f: NetFile = data;
        // setModalProps({
        //   loading: true,
        //   okText: t('saveButton'),
        //   title: f.fileName(),
        // });
        //
        // const value = await f.raw();
        // valueRef.value = value;
        console.log(fileStore.getMarkdownFiles);
      });

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
