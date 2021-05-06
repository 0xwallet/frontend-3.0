<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('shareButton')"
    @ok="shareFile"
    :height="350"
  >
    <Card>
      <template #title>
        <Space
          ><span> {{ t('shareButton') }}{{ t('file') }}:</span>
          <span> {{ file.name + '.' + file.type }}</span>
        </Space>
      </template>
      <template v-if="shareUrl === ''">
        <BasicForm @register="registerForm" :model="model" />
      </template>
      <Descriptions v-if="shareUrl" bordered :column="1">
        <DescriptionsItem :label="t('shareUrl')"
          ><a-button type="link" @click="copy(1)">{{ shareUrl }}</a-button></DescriptionsItem
        >
        <DescriptionsItem :label="t('code')" v-if="file.shareInfo.code"
          ><a-button type="link" @click="copy(2)">{{
            file.shareInfo.code
          }}</a-button></DescriptionsItem
        >
        <DescriptionsItem :label="t('valid')"
          ><a-button type="primary" @click="copy(3)">{{
            t('copyShare')
          }}</a-button></DescriptionsItem
        >
      </Descriptions>
    </Card>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Card, Descriptions, Space } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNetFileStore } from '/@/store/modules/netFile';

  const { t } = useI18n('general.metanet');
  function randomString(len) {
    len = len || 32;
    const chars =
      'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    const maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }
  const schemas: FormSchema[] = [
    {
      field: 'shareType',
      label: t('shareType'),
      component: 'RadioGroup',
      labelWidth: 100,
      defaultValue: 'public',
      componentProps: {
        options: [
          {
            value: 'public',
            label: t('public'),
          },
          {
            value: 'private',
            label: t('private'),
          },
        ],
      },
    },

    {
      field: 'day',
      component: 'InputNumber',
      labelWidth: 100,
      label: '有效期',
      required: true,
      colProps: { span: 12 },
      defaultValue: 7,
    },
    {
      field: 'code',
      component: 'Input',
      labelWidth: 100,
      label: '分享码',
      required: true,
      componentProps: {
        style: { width: '200px' },
      },
      colProps: { span: 12 },
      defaultValue: randomString(4),
      ifShow: ({ values }) => {
        return values.shareType === 'private';
      },
    },
  ];
  export default defineComponent({
    components: {
      BasicModal,
      BasicForm,
      Card,
      Space,
      Descriptions,
      DescriptionsItem: Descriptions.Item,
    },
    setup() {
      const fileStore = useNetFileStore();
      const modelRef = ref({});
      const file = ref<NetFile>({});
      const shareUrl = computed(() => {
        if (!file.value.shareInfo?.uri) return '';
        return `${window.location.origin}/#/s/file?uri=${file.value.shareInfo.uri}`;
      });
      const radioStyle = {
        height: '30px',
        lineHeight: '30px',
      };
      const [registerForm, { validateFields }] = useForm({
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const [register, { setModalProps }] = useModalInner((data) => {
        file.value = unref(data.record);
        file.value.shareInfo.uri = '';
        setModalProps({ showOkBtn: true });
      });

      async function shareFile() {
        try {
          const params = await validateFields();
          if (params.shareType === 'public') {
            await file.value.share();
          } else {
            await file.value.share(params);
          }
        } catch (e) {
          console.log(err);
        } finally {
          setModalProps({ showOkBtn: false });
        }
      }
      function copy(v) {
        file.value.copyShareUrl(v);
      }
      return {
        register,
        schemas,
        registerForm,
        model: modelRef,
        shareFile,
        file,
        shareUrl,
        copy,
        t,
        radioStyle,
      };
    },
  });
</script>
