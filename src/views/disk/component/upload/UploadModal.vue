<template>
  <BasicModal v-bind="$attrs" @register="register" title="上传文件">
    <Upload multiple :fileList="filelist" :customRequest="uploadFiles">
      <a-button> <upload-outlined /> 选择文件 </a-button>
    </Upload>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Upload } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    components: { BasicModal, Upload, UploadOutlined },
    setup() {
      const filelist = ref([]);
      const { createErrorModal } = useMessage();

      const [register, { closeModal }] = useModalInner((data) => {
        console.log(data);
      });
      function uploadFiles(v) {
        console.log(11, v);
      }
      return { register, filelist, uploadFiles };
    },
  });
</script>
