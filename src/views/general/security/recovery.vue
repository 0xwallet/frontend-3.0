<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('recoveryTitle') }}</BasicTitle>
    </template>
    <template #extra>
      <Button type="link" @click="openDeviceModal">{{ t('addRecoveryInfo') }}</Button>
      <Button type="link" @click="openDeviceModal">{{ t('changePassword') }}</Button>
    </template>
    <List :grid="{ gutter: 2, column: 2 }" :data-source="deviceList">
      <template #renderItem="{ item, index }">
        <ListItem>
          <Card class="h-50">
            <template #title
              ><Icon :icon="item.icon" /><span class="m-2">{{ item.name }}</span>
            </template>
            <div class="h-12">
              <Select
                :style="`width: 100%`"
                :showArrow="!item.list && !(item.list.length === 1)"
                v-model:value="value[item.type]"
                @change="changeNMobile"
                ><SelectOption v-for="(v, k) in item.list" :key="k" :value="k">{{
                  v.title
                }}</SelectOption></Select
              >
            </div>

            <template #actions>
              <!--              <span> {{ value[item.type] }}</span>-->
              <span>{{ item.list[value[item.type]]?.status ? '绑定' : '未绑定' }}</span>
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
  import { Card, List, Tag, Select } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import DeviceModal from './deviceModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useQuery } from '@vue/apollo-composable';
  import { me } from '/@/hooks/apollo/gqlUser';
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
      Select,
      SelectOption: Select.Option,
      Button,
    },
    setup() {
      const { t } = useI18n('general.security');
      const { createMessage } = useMessage();
      const [register, { openModal, setModalProps }] = useModal();
      const deviceList = ref([
        {
          name: t('recoveryEmail'),
          icon: 'fa-solid:at',
          list: [],
        },
        {
          name: 'usb',
          list: [],
        },
      ]);
      const value = ref({
        nMobile: '',
      });
      const { onResult: getMe, refetch } = useQuery(me, null, { fetchPolicy: 'network-only' });
      getMe((res) => {
        res.data?.me.wallets.forEach((v) => {
          // console.log(v);
          if (v.tags[0] !== 'MESSAGE' && v.info.publicKey !== null) {
            deviceList.value[0].list = [];
            value.value.nMobile = deviceList.value[0].list.length;
            deviceList.value[0].list.push({
              value: v.info.publicKey,
              title: v.info.publicKey,
              status: true,
            });
          }
        });
        deviceList.value[0].list.push({
          value: '111',
          title: '222',
          status: false,
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

      function changeNMobile(k, option) {
        console.log(option, k);
      }

      return {
        t,
        register,
        openDeviceModal,
        deviceList,
        Select,
        value,
        changeNMobile,
      };
    },
  });
</script>
