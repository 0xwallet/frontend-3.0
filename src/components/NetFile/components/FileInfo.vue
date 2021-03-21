<template>
  <Drawer
    placement="right"
    :visible="visible"
    @close="closeInfo"
    :mask="false"
    :width="400"
    :wrapClassName="'!mt-52 !mr-10'"
  >
    <template #title v-if="visible">
      <span @click="copyUrl(4)">{{ file.fileName() }}</span>
    </template>
    <Tabs v-if="visible">
      <TabPane key="basic" :tab="t('basic')">
        <Space direction="vertical">
          <div class="info_header">
            <Icon :type="file.type" :size="100" />
            <p v-if="mode"
              >{{ byteTransfer(space.used).value }} {{ byteTransfer(space.used).unit }} /
              <span>{{ ((space.used / space.total) * 100).toFixed(2) }}%</span>
            </p>
            <div v-else>
              <p v-if="file.type !== 'folder'"
                >{{ byteTransfer(file.size).value }} {{ byteTransfer(file.size).unit }} /
                <span>{{ ((file.size / space.total) * 100).toFixed(2) }}%</span>
              </p>
              <p v-else>
                <Button @click="getDirSize" v-if="dirSize === 0">查询</Button>
                <span v-else
                  >{{ byteTransfer(dirSize).value }} {{ byteTransfer(dirSize).unit }} /
                  {{ ((dirSize / space.total) * 100).toFixed(2) }}%</span
                >
              </p>
              <p v-if="mode === 'share' && file.status.isCollected"
                >被收藏数：{{ file.status.collectedCount }}</p
              >
              <!--            <p-->
              <!--              >{{ byteTransfer(info.space.totalSpace).value }}-->
              <!--              {{ byteTransfer(info.space.totalSpace).unit }}({{ info.size }} Bytes)</p-->
              <!--            >-->
            </div>
          </div>
          <Divider type="horizontal" />
          <Descriptions :column="1">
            <DescriptionsItem :label="t('url')" v-if="mode === 'share'"
              ><Button type="link" @click="copyUrl(3)">{{ file.uri }}</Button>
            </DescriptionsItem>
            <DescriptionsItem :label="t('url')" v-if="mode === 'publish'"
              ><Hash :hash="file.publishInfo.txid" mode="txid" />
            </DescriptionsItem>
            <DescriptionsItem
              label="Hash"
              v-if="file.hash && (mode === 'share' || mode === 'publish')"
              ><Hash :hash="file.hash"
            /></DescriptionsItem>
            <DescriptionsItem :label="t('type')">{{ file.type }}</DescriptionsItem>
            <DescriptionsItem :label="'Owner'" v-if="mode === 'home'">Me </DescriptionsItem>
            <DescriptionsItem :label="t('location')" v-if="mode !== 'home'">
              <span v-for="(v, i) in file.Location()" :key="i">{{ v }}/</span>
            </DescriptionsItem>
            <DescriptionsItem :label="t('status')" v-if="mode === 'basic'">{{
              file.status.isShared ? t('shared') : t('unShared')
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('modified')" v-if="mode !== 'home'">{{
              time(file.updatedAt)
            }}</DescriptionsItem>
            <DescriptionsItem
              :label="t('opened')"
              v-if="!(mode === 'share') && mode !== 'home'"
            ></DescriptionsItem>
            <DescriptionsItem :label="t('created')" v-if="mode !== 'home'">{{
              time(file.createdAt)
            }}</DescriptionsItem>
          </Descriptions>
        </Space>
        <div class="w-2/3 grid grid-col-1 gap-2">
          <div
            ><Progress :percent="((space.used / space.total) * 100).toFixed(2)" size="small"
          /></div>
          <div>
            {{ byteTransfer(space.used).value }} {{ byteTransfer(space.used).unit }} /
            <span
              >{{ byteTransfer(space.total).value }} {{ byteTransfer(space.total).unit }}</span
            ></div
          >
          <div
            ><Button type="primary">{{ t('buyStorage') }}</Button></div
          >
        </div>
        <Desc :desc="file.desc" :id="file.id" :share="mode === 'share'" v-if="mode !== 'home'" />
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
      <TabPane key="version" :tab="t('version')" v-if="mode === 'publish'">
        <List item-layout="horizontal" :data-source="file.publishInfo.history">
          <template #renderItem="{ item, index }">
            <ListItem>
              <template #actions>
                <a-button @click="changeVersion(item.id)">{{ t('changeVersion') }}</a-button>
              </template>
              <ListItemMeta>
                <template #title>
                  <a href="https://www.antdv.com/">{{ item.id }}</a>
                </template>
              </ListItemMeta>
            </ListItem>
          </template>
        </List></TabPane
      >
    </Tabs>
  </Drawer>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import {
    Tabs,
    Card,
    Descriptions,
    Space,
    Divider,
    Input,
    Button,
    Drawer,
    Progress,
  } from 'ant-design-vue';
  import { EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { byteTransfer } from '/@/utils/disk/file';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { List } from 'ant-design-vue';
  import { Hash, Icon, NetGql } from '/@/components/NetFile';
  import Desc from './Desc.vue';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { fileStore } from '/@/store/modules/netFile';
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
      Progress,
    },
    setup() {
      const file: NetFile = computed<NetFile>(() => {
        console.log(fileStore.getFileInfo.file);
        return fileStore.getFileInfo.file;
      });

      const mode = computed(() => fileStore.getFileInfo.mode);
      const space = computed(() => fileStore.getSpace);
      const visible = computed(() => {
        return fileStore.getFileInfo.button && fileStore.getFileInfo.file !== null;
      });

      const desc = ref('');

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
        if (mode.value === 'basic') return;
        console.log(mode);
        file.value.copyShareUrl(mode);
      }
      function closeInfo() {
        fileStore.setFileInfo({ file: null, mode: 'basic' });
      }
      const dirSize = computed(() => {
        return fileStore.getFileSize[file.value.id] || 0;
      });

      function getDirSize() {
        useApollo({
          mode: 'query',
          gql: NetGql.Basic.DirSize,
          variables: { dirId: file.value.id },
        }).then((res) => {
          // dirSize.value = res.data?.driveDirSize;
          fileStore.setFileSize({ dirId: file.value.id, size: res.data?.driveDirSize });
        });
      }
      async function changeVersion(publishHistoryId) {
        await PublishChangeVerison({
          id: file.value.publishId,
          publishHistoryId,
        });
      }

      return {
        t,
        file,
        desc,
        byteTransfer,
        getLocation,
        time,
        copyUrl,
        mode,
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
        getDirSize,
        dirSize,
        changeVersion,
        space,
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
