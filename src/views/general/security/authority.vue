<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('authorityTitle') }}</BasicTitle>
    </template>
  </Card>
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  export default defineComponent({
    components: {
      BasicTitle,
      Card,
      CardMeta: Card.Meta,
      Divider,
    },
    setup() {
      const { t } = useI18n('general.security');
      return {
        t,
      };
    },
  });
</script>
<style lang="less" scoped></style>
