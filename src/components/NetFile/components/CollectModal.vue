<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('collectionTitle')" @ok="collect">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMutation } from '@vue/apollo-composable';
  import { useForm, BasicForm } from '/@/components/Form';
  import { NetFile, NetGql } from '/@/components/NetFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const mode=ref('share')
      const id=ref(0)
      const code=ref('')
      const [register, { closeModal }] = useModalInner((data) => {
        console.log(data)
        mode.value=data.mode
        id.value=data.id
        code.value=data.code

        // setFieldsValue({ newName: f.fileName() });
      });

      const { mutate: collectShare } = useMutation(NetGql.Collection.CreateShare);
      const { mutate: collectPublish } = useMutation(NetGql.Collection.CreatePublish);
      const [registerForm, { validateFields }] = useForm({
        schemas: [
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

      async function collect() {
        try {
          const data = await validateFields();
          if (mode.value==='share'){
            await collectShare({id:id.value,code:code.value,desc:data.desc})
            return
          }
          if (mode.value==='publish'){
            await collectPublish({id:id.value,desc:data.desc})
            return
          }
        } catch (err) {
          console.log(err);
          createErrorModal({ title: t('error'), content: err.message });
        } finally {
          createMessage.success(t('collectionSuccess'));
          closeModal();
        }
      }
      return { register, t, registerForm, collect };
    },
  });
</script>
