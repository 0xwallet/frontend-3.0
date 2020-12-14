<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('shareButton')" @ok="shareFile">
    <span class="title"> {{ t('fileName') }}：</span>
    <span class="title">{{ file.name + '.' + file.type }}</span>
    <BasicForm @register="registerForm" :model="model" layout="vertical" v-if="file.uri === ''" />
    <div v-if="file.uri !== ''">
      <Row>
        <Col :span="4"> {{ t('shareUrl') }}</Col>
        <Col :span="20">
          <a-button type="link" @click="copy(1)">{{ shareUrl }}</a-button>
        </Col>
      </Row>
      <Row>
        <Col :span="4"> 提取码</Col>
        <Col :span="20">
          <a-button type="link" @click="copy(2)">{{ file.code }}</a-button>
        </Col>
        <!--        <Col> 提取码：{{ file.code }}</Col>-->
        <!--        <Col> 7天内有效，</Col>-->
      </Row>
      <Row type="flex" justify="center">
        <Col :span="12"> 7天内有效</Col>
        <Col :span="12"
          ><a-button type="link" @click="copy(3)">{{ t('copyShare') }}</a-button>
        </Col>
      </Row>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Row, Col } from 'ant-design-vue';
  import { File } from '../type/file';
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
      label: '分享码',
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: randomString(4),
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm, Row, Col },
    setup() {
      const modelRef = ref({});
      const file = ref(File);
      const shareUrl = computed(() => {
        return `${window.location.origin}/#/general/shareFile/${file.value.uri}`;
      });
      const [registerForm, { validateFields }] = useForm({
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const { createErrorModal } = useMessage();
      const [register, { setModalProps }] = useModalInner((data) => {
        shareUrl.value = false;
        file.value = unref(data.record);
      });

      async function shareFile() {
        const params = await validateFields();

        if (!(await file.value.share(params.code))) {
          createErrorModal({ title: t('failed'), content: t('share') + ' ' + t('failed') });
        }
        shareUrl.value = true;
      }
      function copy(v) {
        file.value.copyShareUrl(v);
      }
      function copyUrl() {}
      return {
        register,
        schemas,
        registerForm,
        model: modelRef,
        shareFile,
        file,
        shareUrl,
        copy,
        copyUrl,
        t,
      };
    },
  });
</script>

<style>
  .title {
    font-size: 25px;
  }
</style>
