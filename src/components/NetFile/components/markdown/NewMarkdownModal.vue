<template>
  <BasicModal v-bind="$attrs" @register="register" :title="'new'" @ok="createMarkdown">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useForm, BasicForm } from '/@/components/Form';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const index = ref(0);
      const content = ref('');
      const [register, { closeModal }] = useModalInner((data) => {
        index.value = data.index;
        content.value = data.content;
        console.log(index.value);
      });

      const [registerForm, { validateFields }] = useForm({
        schemas: [
          {
            field: 'name',
            component: 'Input',
            defaultValue: '',
            label: t('name'),
            required: true,
          },
          {
            field: 'desc',
            component: 'Input',
            defaultValue: '',
            label: t('desc'),
          },
        ],
        labelWidth: 150,
        showActionButtonGroup: false,
      });

      async function createMarkdown() {
        if (!fileStore.getMarkdownFiles[index.value]) return;
        try {
          const data = await validateFields();
          await fileStore.newMarkdownFile({
            content: content.value,
            name: data.name + '.md',
            desc: data.desc,
          });
          fileStore.setMarkdownEdited({
            index: index.value,
            edited: false,
            title: data.name + '.md',
          });
        } finally {
          closeModal();
        }
      }

      return { register, t, registerForm, createMarkdown };
    },
  });
</script>
