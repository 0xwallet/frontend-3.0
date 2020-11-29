<template>
  <BasicModal v-bind="$attrs" @register="register" title="分享文件" @ok="shareFile">
    <p> 文件名：{{ file.fullName + '.' + file.type }}</p>
    <BasicForm @register="registerForm" :model="model" v-if="!shareUrl" />
    <div v-if="shareUrl">
      <p>
        分享url：<a-button type="link" @click="copyUrl">{{ file.shareUrl() }}</a-button>
      </p>
      <p> 分享token：{{ file.token }}</p>
      <p> 分享code：{{ file.code }}</p>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { File } from '../type/file';

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
    components: { BasicModal, BasicForm },
    setup() {
      const modelRef = ref({});
      const file = ref({});
      const shareUrl = ref(false);
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
        file.value = data.record;
      });

      async function shareFile() {
        const paramas = await validateFields();

        const f: File = file.value;
        if (!(await f.share(paramas.code))) {
          createErrorModal({ title: '失败', content: '分享失败' });
        }
        shareUrl.value = true;
      }
      function copyUrl() {
        const f: File = file.value;
        f.copyShareUrl();
      }
      return {
        register,
        schemas,
        registerForm,
        model: modelRef,
        shareFile,
        file,
        shareUrl,
        copyUrl,
      };
    },
  });
</script>
