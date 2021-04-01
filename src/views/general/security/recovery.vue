<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('recoveryTitle') }}</BasicTitle>
    </template>
    <template #extra>
      <Button type="link">{{ t('addRecoveryInfo') }}</Button>
      <Button type="link">{{ t('changePassword') }}</Button>
    </template>
    <List :grid="{ gutter: 2, column: 2 }" :data-source="list">
      <template #renderItem="{ item, index }">
        <ListItem>
          <Card class="h-50">
            <template #title
              ><Icon :icon="item.icon" /><span class="m-2">{{ item.name }}</span>
            </template>
            <div class="h-12">
              {{ item.value }}
            </div>

            <template #actions>
              <!--              <span> {{ value[item.type] }}</span>-->
              <span>{{ item?.status ? '绑定' : '未绑定' }}</span>
              <span>绑定</span>
              <span>删除</span>
            </template>
          </Card>
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
  import { Icon } from '/@/components/Icon';
  import { Button } from '/@/components/Button';

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
      Icon,
      Button,
    },
    setup() {
      const { t } = useI18n('general.security');
      const { createMessage } = useMessage();
      const [register, { openModal, setModalProps }] = useModal();
      const list = ref([
        {
          name: t('recoveryEmail'),
          icon: 'fa-solid:at',
          value: 'xxx@qq.com',
          status: true,
        },
        {
          name: t('mobileNumber'),
          icon: 'fa-solid:sms',
          value: '13888888888',
          status: false,
        },
      ]);

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
        list,
      };
    },
  });
</script>
