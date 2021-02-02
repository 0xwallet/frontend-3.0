<template
  ><Affix
    :offset-bottom="bottom"
    v-if="show && status"
    @click="openUploadModal"
    class="upload_status"
  >
    <div class="upload_info">
      <span>nkn节点：{{ clients }}</span>
      <span>{{ status.name }}</span>
      <span>{{ speedFormat(status.speed) }}</span>
    </div>
    <Progress :percent="per" :status="per === 100 ? 'success' : 'active'" size="small" />
  </Affix>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Affix, Progress } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { fileStore } from '/@/store/modules/netFile';
  import Mitt from '/@/utils/mitt';
  import { NknClient } from '/@/hooks/nkn/getNKN';

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
      const clients = computed(() => {
        return NknClient.length;
      });
      const show = ref(true);
      let now = ref(0);
      let max = ref(10);
      setInterval(() => {
        if (now.value < max.value) {
          now.value++;
          return;
        }
        now.value = 0;
      }, 2500);
      const mitt = new Mitt();
      function openUploadModal() {
        emit('openUploadModal');
        mitt.emit('foo', { a: 'b' });
      }

      function speedFormat(speed: number): string {
        if (speed > 0.9) {
          return speed.toFixed(2) + ' MB/s';
        } else if (speed * 1000 > 0.9) {
          return (speed * 1000).toFixed(2) + 'KB/s';
        }
        return (speed * 1000 * 1000).toFixed(2) + 'B/s';
      }

      return { bottom, per, status, openUploadModal, show, speedFormat, clients };
    },
  });
</script>
<style lang="less">
  .upload_status {
    position: fixed;
    left: 15%;
    bottom: 1%;
    width: 80%;
    background: @white;
    border: 1px solid #999;
    border-radius: 2px;
    border-radius: 4px;
    padding: 5px;
  }

  .upload_info {
    display: flex;
    justify-content: space-between;
  }
</style>
