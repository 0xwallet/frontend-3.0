<template>
  <div>
    <Card hoverable>
      <template #title>
        <BasicTitle>{{ t('assetTitle') }}</BasicTitle>
      </template>
      <template #extra
        ><Button type="link" @click="openAddAssetModal">{{ t('addAsset') }}</Button></template
      >
      <List :grid="{ gutter: 16, column: 4 }" :data-source="data">
        <template #renderItem="{ item, index }">
          <ListItem>
            <Card>
              <template #title>{{ item.type === 1 ? '信用卡' : 'Money Button' }}</template>
              {{ item.number }}
            </Card>
          </ListItem>
        </template>
      </List>
    </Card>
    <addAssetModal @register="registerModal" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, Tag, List } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Button } from '/@/components/Button';
  import { useModal } from '/@/components/Modal';
  import addAssetModal from './component/addAssetModal.vue';
  export default defineComponent({
    components: {
      BasicTitle,
      Tag,
      Card,
      CardMeta: Card.Meta,
      Button,
      addAssetModal,
      List,
      ListItem: List.Item,
    },
    setup() {
      const { t } = useI18n('general.account');
      const { createMessage } = useMessage();
      const [registerModal, { openModal }] = useModal();
      function openAddAssetModal() {
        openModal(true, {}, true);
      }
      function handleSubmit() {}

      const data = ref([
        { title: '信用卡1', type: 1, number: '222222' },
        { title: 'money', type: 2, number: '3333' },
      ]);
      return {
        t,
        registerModal,
        handleSubmit,
        openAddAssetModal,
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
