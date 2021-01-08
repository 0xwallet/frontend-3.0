<template>
  <div>{{ params }}</div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveFindShare, drivePreviewShare } from '/@/hooks/apollo/gqlFile';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    name: 'ReleaseFile',

    setup() {
      const { currentRoute } = useRouter();
      const params = computed(() => {
        return unref(currentRoute).query.hash;
      });
      onMounted(() => {
        console.log(params);
        useApollo({ mode: 'query', gql: driveFindShare, variables: { uri: params.value } }).then(
          (res) => {
            let fileName = res.data?.driveFindShare.userFile.fullName.slice(-1)[0];
            console.log(fileName);
          }
        );
      });
      return {
        params,
      };
    },
  });
</script>
<style>
  .img {
    width: 100px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    z-index: 999;
  }
</style>
