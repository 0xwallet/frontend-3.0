<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('shareButton')" @ok="shareFile">
    <Card>
      <template #title>
        <Space
          ><span> {{ t('shareButton') }}{{ t('file') }}:</span>
          <span> {{ file.name + '.' + file.type }}</span>
        </Space>
      </template>
      <template v-if="shareUrl === ''">
        <RadioGroup v-model:value="radio">
          <Radio :style="radioStyle" :value="0"> {{ t('public') }}</Radio>
          <Radio :style="radioStyle" :value="1"> {{ t('private') }} </Radio>
        </RadioGroup>
        <BasicForm @register="registerForm" :model="model" v-if="radio === 1" />
      </template>
      <template v-if="shareUrl !== ''">
        <Space>
          <span>{{ t('shareUrl') }}</span>
          <a-button type="link" @click="copy(1)">{{ shareUrl }}</a-button></Space
        >
        <br />
        <Space v-if="radio === 1">
          <span>{{ t('code') }}</span>
          <a-button type="link" @click="copy(2)">{{ file.code }}</a-button>
        </Space>
        <br />
        <Space>
          <span>{{ t('valid') }}</span>
          <a-button type="primary" @click="copy(3)">{{ t('copyShare') }}</a-button>
        </Space>
      </template>
    </Card>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Card, Space, Radio } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
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
      field: 'code',
      component: 'Input',
      labelWidth: 100,
      label: '分享码',
      required: true,
      colProps: {
        span: 8,
      },
      defaultValue: randomString(4),
    },
    {
      field: 'day',
      component: 'InputNumber',
      labelWidth: 100,
      label: '有效期',
      required: true,
      colProps: {
        span: 8,
      },
      defaultValue: 7,
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Card, Space, Radio, RadioGroup: Radio.Group },
    setup() {
      const modelRef = ref({});
      const file = ref(NetFile);
      const radio = ref(0);
      const shareUrl = computed(() => {
        if (file.value.uri == '') return '';
        return `${window.location.origin}/#/s/file?uri=${file.value.uri}`;
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

      const [register] = useModalInner((data) => {
        file.value = unref(data.record);
        radio.value = 0;
        file.value.uri = '';
      });

      async function shareFile() {
        if (radio.value === 0) {
          await file.value.share();
          return;
        }
        const params = await validateFields();
        await file.value.share(params);
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
        radio,
      };
    },
  });
</script>

<style>
  .title {
    font-size: 25px;
  }
</style>
