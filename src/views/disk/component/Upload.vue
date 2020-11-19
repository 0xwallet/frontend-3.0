<template>
  <div class="p-4">
    <BasicUpload :maxSize="20" :maxNumber="10" @change="handleChange" :api="uploadApi" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicUpload } from '/@/components/Upload';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { uploadApi } from '/@/api/sys/upload';

  export default defineComponent({
    components: { BasicUpload },
    setup() {
      const { createMessage } = useMessage();

      return {
        handleChange: (list: string[]) => {
          createMessage.info(`已上传文件${JSON.stringify(list)}`);
        },
        uploadApi,
      };
    },
  });
</script>
