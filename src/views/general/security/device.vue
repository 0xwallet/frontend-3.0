<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('deviceTitle') }}</BasicTitle>
    </template>
    <template #extra>
      <a-button type="link" @click="openDeviceModal">{{ t('deviceModalTitle') }}</a-button>
    </template>
    <List item-layout="horizontal" :data-source="deviceList">
      <template #renderItem="{ item, index }">
        <ListItem>
          <ListItemMeta :description="item.publicKey">
            <template #title> Public Key </template>
          </ListItemMeta>
        </ListItem>
      </template>
    </List>
  </Card>
  <DeviceModal @register="register" />
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, List, Tag } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import DeviceModal from './deviceModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getMe } from '/@/hooks/apollo/apollo';

  export default defineComponent({
    components: {
      BasicTitle,
      Tag,
      Card,
      CardMeta: Card.Meta,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      DeviceModal,
    },
    setup() {
      const { t } = useI18n('general.security');
      const { createMessage } = useMessage();
      const [register, { openModal, setModalProps }] = useModal();
      const deviceList = ref([]);
      function fetchData() {
        getMe().then((res) => {
          deviceList.value = [];
          res.wallets.forEach((v) => {
            if (v.tags[0] !== 'MESSAGE' && v.info.publicKey !== null) {
              deviceList.value.push({ publicKey: v.info.publicKey });
            }
          });
        });
      }
      fetchData();

      function openDeviceModal() {
        openModal(true);
        setModalProps({
          title: t('deviceModalTitle'),
          canFullscreen: false,
          afterClose: () => {
            fetchData();
          },
        });
      }
      return {
        t,
        register,
        openDeviceModal,
        deviceList,
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
