<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('publishFile')" @ok="publishFile">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { NetGql } from '/@/components/NetFile';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const select = ref([
        {
          label: '新发布',
          value: 'new',
          key: '1',
        },
      ]);
      let id = '';
      const { createErrorModal, createMessage } = useMessage();
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas: [
          {
            field: 'tag',
            label: 'TAG',
            component: 'Input',
            componentProps: {
              placeholder: '可为空',
            },
          },
          {
            field: 'id',
            label: 'Publish ID',
            component: 'Select',
            defaultValue: 'new',
            componentProps: {
              options: select,
            },
          },
        ],
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal }] = useModalInner((data) => {
        id = data.id;
        refetch();
      });
      const { onResult, refetch } = useQuery(NetGql.Publish.List, null, () => ({
        fetchPolicy: 'network-only',
      }));
      const { mutate: PublishFile } = useMutation(NetGql.Publish.Create);
      const { mutate: UpdatePublishFile } = useMutation(NetGql.Publish.Update);

      onResult((res) => {
        const list = res.data.driveListPublishs;

        list.forEach((v) => {
          select.value.push({ label: v.id, value: v.id, key: v.id });
        });
      });
      async function publishFile() {
        try {
          const data = await validateFields();
          if (data.id === 'new') {
            await PublishFile({ userFileId: id });
          } else {
            await UpdatePublishFile({ userFileId: id, id: data.id });
          }
          createMessage.success(t('publishSuccess'));
        } catch (e) {
          createErrorModal({ content: e });
        } finally {
          closeModal();
        }
      }

      return { register, t, registerForm, publishFile };
    },
  });
</script>
