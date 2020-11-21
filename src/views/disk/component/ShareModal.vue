<template>
  <BasicModal v-bind="$attrs" @register="register" title="分享文件" @ok="shareFile">
    文件名：{{ file.fullName + '.' + file.type }}
    <BasicForm @register="registerForm" :model="model" v-if="shareUrl.uri === undefined" />
    <div v-if="shareUrl.uri !== undefined">
      <p> 分享url：{{ shareUrl.uri }}</p>
      <p> 分享token：{{ shareUrl.token }}</p>
      <p> 分享code：{{ shareUrl.code }}</p>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveCreateShare } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';

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
      const shareUrl = ref({});
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
        shareUrl.value = {};
        console.log(shareUrl.value);
        console.log(file.value);
      });

      function shareFile() {
        validateFields().then((params) => {
          useApollo()
            .mutate({
              mutation: driveCreateShare,
              variables: { ...params, userFileId: file.value.id },
            })
            .then((res) => {
              console.log(res);
              shareUrl.value = res.data?.driveCreateShare;
            });
        });
      }
      return { register, schemas, registerForm, model: modelRef, shareFile, file, shareUrl };
    },
  });
</script>
