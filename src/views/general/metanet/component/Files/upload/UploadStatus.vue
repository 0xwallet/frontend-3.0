<template
  ><Affix :offset-bottom="bottom" v-if="status" @click="openUploadModal" class="upload_status">
    {{ status.name }}
    <Progress :percent="per" :status="per === 100 ? 'success' : 'active'" size="small" />
  </Affix>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Affix, Progress } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { fileStore } from '/@/store/modules/netFile';
  import mitt from 'mitt';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      Affix,
      Progress,
    },
    emits: ['openUploadModal'],
    setup(_, { emit }) {
      const bottom = ref(10);
      const per = computed(() => {
        if (fileStore.getUploadList.length > 0) {
          const total = fileStore.getUploadList.reduce((total, v) => {
            return total + v.percent;
          }, 0);
          return Number((total / fileStore.getUploadList.length).toFixed(2));
        }
        return 0;
      });
      const status = computed(() => {
        if (fileStore.getUploadList.length > 0) {
          max.value = fileStore.getUploadList.length - 1;
          return fileStore.getUploadList[now.value];
        }
        return false;
      });
      let now = ref(0);
      let max = ref(10);
      setInterval(() => {
        if (now.value < max.value) {
          now.value++;
          return;
        }
        now.value = 0;
      }, 2500);
      function openUploadModal() {
        emit('openUploadModal');
      }
      mitt().emit('foo', { a: 'b' });
      return { bottom, per, status, openUploadModal };
    },
  });
</script>
<style lang="less">
  .upload_status {
    position: fixed;
    left: 50%;
    bottom: 10%;
    width: 200px;
    background: @white;
    border: 1px solid #999;
    border-radius: 2px;
    border-radius: 4px;
    padding: 5px;
  }
</style>
