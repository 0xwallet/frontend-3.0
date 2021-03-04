<template>
  <Drawer
    placement="right"
    :visible="visible"
    @close="closeInfo"
    :mask="false"
    :width="400"
    :wrapClassName="'!mt-52'"
  >
    <template #title>
      <span @click="copyUrl(4)">{{ info.fullName?.slice(-1)[0] || 'none' }}</span>
    </template>
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
            <DescriptionsItem :label="t('url')" v-if="share"
              ><a-button type="link" @click="copyUrl(3)">{{ info.uri }}</a-button>
            </DescriptionsItem>
            <DescriptionsItem label="Hash" v-if="info.hash && share"
              ><Hash :hash="info.hash"
            /></DescriptionsItem>
            <DescriptionsItem :label="t('type')">{{ info.type }}</DescriptionsItem>
            <DescriptionsItem :label="t('location')">
              <span v-for="(v, i) in info.Location()" :key="i">{{ v }}/</span>
            </DescriptionsItem>
            <DescriptionsItem :label="t('modified')">{{ time(info.updatedAt) }}</DescriptionsItem>
            <DescriptionsItem :label="t('opened')" v-if="!share"></DescriptionsItem>
            <DescriptionsItem :label="t('created')">{{ time(info.createdAt) }}</DescriptionsItem>
            <DescriptionsItem :label="t('status')">{{
              info.isShared ? t('shared') : t('unShared')
            }}</DescriptionsItem>
          </Descriptions>
        </Space>
        <Desc :desc="info.desc" :id="info.id" :share="share" />
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
    </Tabs></Drawer
  >
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions, Space, Divider, Input, Button, Drawer } from 'ant-design-vue';
  import { EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { byteTransfer } from '/@/utils/disk/file';
  import { propTypes } from '/@/utils/propTypes';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { List } from 'ant-design-vue';
  import { Hash, Icon } from '/@/components/NetFile';
  import Desc from './Desc.vue';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'FileInfo',
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
      Desc,
      Hash,
      Drawer,
    },
    props: {
      file: propTypes.any,
      share: propTypes.bool.def(false),
      visible: propTypes.bool.def(false),
    },
    setup(props) {
      const info: NetFile = computed<NetFile>(() => {
        if (props.file.item) {
          console.log(props.file.item.userFile.fullName.slice(-1)[0]);
          const file = new NetFile({ userFile: props.file.item });
          console.log(file);
          return file;
        }
        console.log(props.file);
        return props.file;
      });
      const share = computed(() => {
        return props.share;
      });
      const visible = computed(() => {
        return props.visible && info.value.id !== undefined;
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
        if (!share) return;
        info.value.copyShareUrl(mode);
      }
      function closeInfo() {}
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
        share,
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
        visible,
        closeInfo,
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
