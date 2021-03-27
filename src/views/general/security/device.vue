<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('deviceTitle') }}</BasicTitle>
    </template>
    <template #extra>
      <Button type="link" @click="openDeviceModal">{{ t('deviceModalTitle') }}</Button>
    </template>
    <List :grid="{ gutter: 2, column: 3 }" :data-source="deviceList">
      <template #renderItem="{ item, index }">
        <ListItem>
          <Card class="h-50">
            <template #title>
              <Icon :icon="item.icon" /><span class="m-2">{{ item.name }}</span>
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
  import { defineComponent, ref, watch } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, List, Tag, Select } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import DeviceModal from './deviceModal.vue';
  import { useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { Button } from '/@/components/Button';
  import { propTypes } from '/@/utils/propTypes';

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
    props: {
      list: propTypes.array.def([]),
    },
    setup(props) {
      const { t } = useI18n('general.security');
      const { createMessage } = useMessage();
      const [register, { openModal, setModalProps }] = useModal();
      watch(
        () => props.list,
        (list) => {
          deviceList.value[0].list = [];
          list.forEach((v) => {
            // console.log(v);
            if (v.tags[0] !== 'MESSAGE' && v.info.publicKey !== null) {
              value.value.nMobile = deviceList.value[0].list.length;
              deviceList.value[0].list.push({
                value: v.info.publicKey,
                title: v.info.publicKey,
                status: true,
              });
            }
          });
        }
      );
      const deviceList = ref([
        {
          name: 'nMobile',
          type: 'nMobile',
          icon: 'fa-solid:comment-dots',
          list: [],
        },
        {
          name: 'WebAuthn USB',
          type: 'usb',
          icon: 'fa-brands:usb',
          list: [],
        },
        {
          name: t('fingerprint'),
          type: 'fingerprint',
          icon: 'fa-solid:fingerprint',
          list: [],
        },
      ]);

      const value = ref({
        nMobile: '',
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
        value,
        changeNMobile,
      };
    },
  });
</script>
