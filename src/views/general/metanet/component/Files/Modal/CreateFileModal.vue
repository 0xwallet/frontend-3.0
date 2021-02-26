<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('createFile')" @ok="createFile">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CryptoES from 'crypto-es';
  import { buildUUID } from '/@/utils/uuid';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
  const schemas: FormSchema[] = [
    {
      field: 'type',
      component: 'RadioButtonGroup',
      label: t('type'),
      required: true,
      componentProps: {
        options: [
          { label: 'Txt', value: 'txt', key: 'txt' },
          { label: 'Markdown', value: 'md', key: 'md' },
        ],
      },
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'fullName',
      component: 'Input',
      label: t('fileName'),
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'desc',
      component: 'Input',
      label: t('desc'),
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const modelRef = ref({});
      const path = ref([]);
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const { createErrorModal } = useMessage();

      const [register, { closeModal }] = useModalInner((data) => {
        path.value = [];
        data.forEach((v) => {
          path.value.push(v.name);
        });
      });

      async function createFile() {
        try {
          const data = await validateFields();
          if (data.fullName.indexOf('.' + data.type) === -1) {
            data.fullName += '.' + data.type;
          }
          const file = new File([''], data.fullName, { type: 'text/plain' });
          let wordArray = CryptoES.lib.WordArray.create(await file.arrayBuffer());
          let hash = CryptoES.SHA256(wordArray).toString();
          await fileStore.uploadApiByItem(
            {
              uuid: buildUUID(),
              file,
              size: file.size,
              name: data.fullName,
              hash,
              percent: 0,
              type: data.type,
              status: '',
              thumbUrl: '',
              desc: data.desc,
            },
            path
          );
        } catch (e) {
          console.log(e);
          createErrorModal({ content: e });
        } finally {
          closeModal();
          fileStore.setRefetch();
        }
      }
      return { register, schemas, registerForm, model: modelRef, createFile, t };
    },
  });
</script>
