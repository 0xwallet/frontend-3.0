<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('dataTitle') }}</BasicTitle>
    </template>
    <List :grid="{ gutter: 16, column: 4 }" :data-source="data">
      <template #renderItem="{ item, index }">
        <ListItem>
          <Card :title="item.title"> Card content </Card>
        </ListItem>
      </template>
    </List>
  </Card>
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, Tag, List } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  const data = [
    {
      title: 'app 1',
    },
    {
      title: 'app 2',
    },
    {
      title: 'app 3',
    },
    {
      title: 'app 4',
    },
    {
      title: 'app 5',
    },
  ];
  export default defineComponent({
    components: {
      BasicTitle,
      Tag,
      Card,
      CardMeta: Card.Meta,
      List,
      ListItem: List.Item,
    },
    setup() {
      const { t } = useI18n('general.security');
      const { createMessage } = useMessage();

      function handleSubmit() {}
      return {
        t,
        handleSubmit,
        data,
      };
    },
  });
</script>
<style lang="less" scoped>
  .setRight {
    float: right;
  }

  .line {
    margin: 10px;
  }

  .strong {
    font-weight: bold;
  }
</style>
