<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('deviceTitle') }}</BasicTitle>
    </template>
    <template #extra>
      <a-button type="link" @click="openDeviceModal">{{ t('deviceModalTitle') }}</a-button>
    </template>
    <List :grid="{ gutter: 2, column: 4 }" :data-source="deviceList">
      <template #renderItem="{ item, index }">
        <ListItem>
          <Card :title="item.type" class="h-50">
            <p class="break-all ">{{ item.publicKey }}</p>  </Card>
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
  import { useQuery } from '@vue/apollo-composable';
  import { me } from '/@/hooks/apollo/gqlUser';

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

      const { onResult: getMe, refetch } = useQuery(me,null,{fetchPolicy:'network-only'});
      getMe((res) => {
        deviceList.value = [];
        res.data?.me.wallets.forEach((v) => {
          if (v.tags[0] !== 'MESSAGE' && v.info.publicKey !== null) {
            deviceList.value.push({ publicKey: v.info.publicKey, type: 'NKN-nMobile' });
          }
        });

      });
      function openDeviceModal() {
        openModal(true);
        setModalProps({
          title: t('deviceModalTitle'),
          canFullscreen: false,
          afterClose: () => {
            refetch();
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
