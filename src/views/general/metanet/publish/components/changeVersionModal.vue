<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('changeVersion')" @ok="changeVersion">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation } from '@vue/apollo-composable';
  import { NetGql } from '/@/components/NetFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const id = ref(0);
      const schemas = ref([]);
      const { createErrorModal, createMessage } = useMessage();
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });
      const [register, { closeModal }] = useModalInner((data) => {
        id.value = data.publishId;
        schemas.value = [
          {
            field: 'versionId',
            label: t('version'),
            component: 'Select',
            componentProps: {
              options: data.history
                .map((v) => {
                  if (v.version === data.version) return;
                  return { label: v.version, key: v.version, value: v.id };
                })
                .filter((v) => v),
            },
          },
        ];
      });

      const { mutate: ChangeVersion } = useMutation(NetGql.Publish.ChangeVersion);

      async function changeVersion() {
        try {
          const data = await validateFields();
          await ChangeVersion({ id: id.value, publishHistoryId: data.versionId });
          createMessage.success(`${t('changeVersion')} ${t('success')}`);
        } catch (e) {
          createErrorModal({ content: e });
        } finally {
          closeModal();
        }
      }

      return { register, t, registerForm, changeVersion };
    },
  });
</script>
