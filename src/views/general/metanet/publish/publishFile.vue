<template>
  <div>{{ params }}</div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { getPublishRaw } from '/@/api/publish';
  import { NetGql } from '/@/components/NetFile';

  export default defineComponent({
    name: 'PublishFile',

    setup() {
      const { currentRoute } = useRouter();
      const params = computed(() => {
        return unref(currentRoute).query.txid;
      });
      const { createErrorModal } = useMessage();

      const { onResult } = useQuery(NetGql.Publish.Find, { txid: params.value }, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult(async (res) => {
        console.log(res);
        if (!res.data.driveFindPublish) {
          createErrorModal({ content: '无效TXID' });
          return;
        }
        const f = new NetFile(res.data.driveFindPublish.current);
        if (f.type === 'md') {
          console.log('md');
        }
        const raw = await getPublishRaw(params.value);
        console.log(raw);
      });

      return {
        params,
      };
    },
  });
</script>
