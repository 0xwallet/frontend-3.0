<template>
  <Card hoverable>
    <template #title
      ><Space
        ><a-avatar :src="userPreview.avatar" /><span
          >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</span
        ></Space
      ></template
    >
    <template #extra>...</template>
    <template #cover>
      <img src="/@/assets/images/logo.png" class="img" />
      {{ file.type }}
    </template>
    <template class="ant-card-actions" #actions>
      <a-button type="primary" @click="preview(file)">预览</a-button>
      <a-button type="primary">保存</a-button>
      <a-button type="primary">评论</a-button>
    </template>
    <CardMeta>
      <template #title> {{ file.fullName[file.fullName.length - 1] }} </template>
      <template #description>
        <p>{{ file.byteTransfer() }}</p>
      </template>
    </CardMeta>
  </Card>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Card, Space } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { propTypes } from '/@/utils/propTypes';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { Card, CardMeta: Card.Meta, Space },
    props: {
      uri: propTypes.string,
      user: propTypes.string,
      needCode: propTypes.bool,
    },
    setup(props) {
      const file = computed(() => {
        return fileStore.getShareFile.find((f) => f.uri === props.uri) || null;
      }) as NetFile;
      const userPreview = computed(() => props.user);
      const needCode = computed(() => props.needCode);
      function preview(f: NetFile) {
        f.preview();
      }
      return {
        file,
        t,
        preview,
        userPreview,
        needCode,
      };
    },
  });
</script>

<style>
  .title {
    font-size: 25px;
  }
</style>
