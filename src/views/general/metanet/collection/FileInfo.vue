<template>
  <Tabs>
    <TabPane key="basic" :tab="t('basic')">
      <Space direction="vertical">
        <div class="info_header">
          <Icon :type="info.type" :size="100" />
          <p
            >{{ byteTransfer(info.size).value }} {{ byteTransfer(info.size).unit }}({{
              info.size
            }}
            Bytes)</p
          >
          <p
            >{{ byteTransfer(info.size).value }} {{ byteTransfer(info.size).unit }}({{
              info.size
            }}
            Bytes)</p
          >
        </div>
        <Divider type="horizontal" />
        <Descriptions :column="1">
          <DescriptionsItem :label="t('url')"
            ><a-button type="link" @click="copyUrl(3)">{{ info.uri }}</a-button>
          </DescriptionsItem>
          <DescriptionsItem label="Hash" v-if="info.hash"
            ><Hash :hash="info.hash"
          /></DescriptionsItem>
          <DescriptionsItem :label="t('type')">{{ info.fullType() }}</DescriptionsItem>
          <DescriptionsItem :label="t('expiredAt')">{{ info.expiredAt }}</DescriptionsItem>

          <DescriptionsItem :label="t('code')">{{ info.code }}</DescriptionsItem>

          <!--          <DescriptionsItem :label="t('location')">-->
          <!--            <span v-for="(v, i) in info.Location()" :key="i">{{ v }}/</span>-->
          <!--          </DescriptionsItem>-->
          <!--          <DescriptionsItem :label="t('modified')">{{ time(info.updatedAt) }}</DescriptionsItem>-->
          <!--          <DescriptionsItem :label="t('opened')"></DescriptionsItem>-->
          <!--          <DescriptionsItem :label="t('created')">{{ time(info.createdAt) }}</DescriptionsItem>-->
          <DescriptionsItem :label="t('status')">{{
            info.isShared ? t('shared') : t('unShared')
          }}</DescriptionsItem>
        </Descriptions>
      </Space>
    </TabPane>
    <TabPane key="dynamic" :tab="t('dynamic')">
      <List item-layout="horizontal" :data-source="data">
        <template #renderItem="{ item, index }">
          <ListItem>
            <ListItemMeta>
              <template #title>
                {{ item.title }}
              </template>
              <template #description>
                {{ item.content }}
              </template>
            </ListItemMeta>
            <div>{{ item.time }}</div>
          </ListItem>
        </template>
      </List></TabPane
    >
  </Tabs>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions, Space, Divider, Input, Button } from 'ant-design-vue';
  import { EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { byteTransfer } from '/@/utils/disk/file';
  import { propTypes } from '/@/utils/propTypes';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { List } from 'ant-design-vue';
  import { Hash, Icon } from '/@/components/NetFile';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'CollectionFileInfo',
    components: {
      Tabs,
      TabPane: Tabs.TabPane,
      Card,
      Descriptions,
      DescriptionsItem: Descriptions.Item,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      Space,
      Divider,
      Icon,
      InputTextArea: Input.TextArea,
      EditOutlined,
      Button,
      CloseOutlined,
      CheckOutlined,
      Hash,
    },
    props: {
      file: propTypes.any,
    },
    setup(props) {
      const type = ref(1);

      const info: NetFile = computed(() => {
        console.log(props.file);
        if (props.file.item.__typename === 'DriveShare') {
          type.value = 1;
        } else {
          type.value = 2;
        }
        return new NetFile(props.file.item);
      });

      const key = ref('basic');
      const tabList = [
        {
          key: 'basic',
          tab: t('basic'),
        },
        {
          key: 'dynamic',
          tab: t('dynamic'),
        },
      ];

      const desc = ref('');
      function onTabChange(k) {
        key.value = k;
      }
      function getLocation(dir: string[] = []) {
        if (dir.length == 1) {
          return '~';
        }
        return dir;
      }

      function time(t: string): string {
        return formatToDateTime(t, 'YYYY-MM-DD HH:mm:ss');
      }

      function copyUrl(mode: number) {
        info.value.copyShareUrl(mode);
      }
      return {
        t,
        info,
        tabList,
        key,
        onTabChange,
        desc,
        byteTransfer,
        getLocation,
        time,
        copyUrl,
        data: [
          {
            title: '111',
            content: '操作',
            time: '2021-01-29',
          },
          {
            title: '222',
            content: '评论',
            time: '2021-01-29',
          },
        ],
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 10px;
  }

  .desc {
    display: flex;
    justify-content: space-between;
  }

  .TextArea {
    display: flex;
    justify-content: flex-end;
  }

  .info_header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
