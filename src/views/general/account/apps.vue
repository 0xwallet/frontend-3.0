<template>
  <div>
    <Card hoverable>
      <template #title>
        <BasicTitle>{{ t('appsTitle') }}</BasicTitle>
      </template>
      <template #extra
        ><Button type="link" @click="openAddAppModal">{{ t('addApp') }}</Button></template
      >
      <List :grid="{ gutter: 16, column: 4 }" :data-source="data">
        <template #renderItem="{ item, index }">
          <ListItem>
            <Card :title="item.title"> Card content </Card>
          </ListItem>
        </template>
      </List> </Card
    ><addAppModal @register="registerModal" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, Tag, List } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import addAppModal from '/@/views/general/account/component/addAppModal.vue';
  import { useModal } from '/@/components/Modal';
  import { Button } from '/@/components/Button';

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
      addAppModal,
      Button,
    },
    setup() {
      const { t } = useI18n('general.account');
      const { createMessage } = useMessage();
      const [registerModal, { openModal }] = useModal();
      function openAddAppModal() {
        openModal(true);
      }
      function handleSubmit() {}
      return {
        t,
        handleSubmit,
        registerModal,
        openModal,
        data,
        openAddAppModal,
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
