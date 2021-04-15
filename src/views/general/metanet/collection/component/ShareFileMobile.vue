<template>
  <Card hoverable>
    <template #title
      ><Space
        ><Avatar :src="userPreview.avatar" /><span
          >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</span
        ></Space
      ></template
    >
    <template #extra>...</template>
    <template #cover>
      <Svg />
      {{ file.type }}
    </template>
    <template class="ant-card-actions" #actions>
      <a-button type="primary" @click="preview(file)">{{ t('previewButton') }}</a-button>
      <a-button type="primary" @click="save(file)">{{ t('saveButton') }}</a-button>
      <a-button type="primary" @click="favorites(file)">{{ t('favoritesButton') }}</a-button>
      <a-button type="primary" @click="comment(file)">{{ t('comment') }}</a-button>
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
  import { Card, Space, Avatar } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { propTypes } from '/@/utils/propTypes';
  import { useNetFileStore } from '/@/store/modules/netFile';

  const { t } = useI18n('general.metanet');
  import { Svg } from '/@/components/Svg';
  export default defineComponent({
    components: { Card, CardMeta: Card.Meta, Space, Svg, Avatar },
    props: {
      uri: propTypes.string,
      user: propTypes.object,
      needCode: propTypes.bool,
    },
    setup(props) {
      const fileStore = useNetFileStore();
      const file = computed(() => {
        return fileStore.getShareFile.find((f) => f.uri === props.uri) || null;
      });
      const userPreview = computed(() => props.user);
      const needCode = computed(() => props.needCode);
      async function preview(f: NetFile) {
        await f.preview();
      }
      async function favorites(f: NetFile) {
        await f.favorites();
      }

      async function comment(f: NetFile) {
        await f.comment();
      }
      return {
        file,
        t,
        preview,
        userPreview,
        needCode,
        favorites,
        comment,
      };
    },
  });
</script>

<style>
  .title {
    font-size: 25px;
  }
</style>
