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
            <p v-if="mode === 'home'"
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
            <DescriptionsItem :label="t('owner')" v-if="mode === 'home'">Me </DescriptionsItem>
            <DescriptionsItem :label="t('location')" v-if="mode !== 'home' && !collection">
              <span v-for="(v, i) in file.Location()" :key="i">{{ v }}/</span>
            </DescriptionsItem>
            <DescriptionsItem :label="t('state')" v-if="mode === 'basic'">{{
              file.status.isShared ? t('shared') : t('unShared')
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('modifiedDate')" v-if="mode !== 'home' && !collection">{{
              time(file.updatedAt)
            }}</DescriptionsItem>
            <!--            <DescriptionsItem-->
            <!--              :label="t('opened')"-->
            <!--              v-if="!(mode === 'share') && mode !== 'home'"-->
            <!--            ></DescriptionsItem>-->
            <DescriptionsItem :label="t('createDate')" v-if="mode !== 'home' && !collection">{{
              time(file.createdAt)
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('expiredAt')" v-if="mode === 'share' && collection">{{
              time(file.shareInfo.expiredAt)
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('accessCode')" v-if="mode === 'share' && collection">{{
              file.shareInfo.code
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('version')" v-if="mode === 'publish' && collection">{{
              file.publishInfo.version
            }}</DescriptionsItem>
            <DescriptionsItem :label="t('status')" v-if="collection">{{
              file.status
            }}</DescriptionsItem>
          </Descriptions>
        </Space>
        <div class="w-2/3 grid grid-col-1 gap-2" v-if="mode === 'home'">
          <div
            ><Progress
              :percent="space.used / space.total"
              size="small"
              :format="(percent) => `${(percent * 100).toFixed(2)}%`"
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
        <Desc
          :desc="file.desc"
          :id="file.id"
          :share="mode === 'share' || mode === 'publish'"
          v-if="mode !== 'home'"
        />
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
        // console.log(fileStore.getFileInfo.file);
        return fileStore.getFileInfo.file;
      });

      const mode = computed(() => fileStore.getFileInfo.mode);
      const collection = computed(() => fileStore.getFileInfo.collection);
      const space = computed(() => fileStore.getSpace);
      const visible = computed(
        () => fileStore.getFileInfo.button && fileStore.getFileInfo.file !== null
      );

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

      function copyUrl(m: number) {
        switch (mode.value) {
          case 'share':
            file.value.copyShareUrl(m);
            return;
          default:
            return;
        }
      }
      function closeInfo() {
        fileStore.setFileInfo({ file: null, mode: 'basic', collection: false });
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
        space,
        collection,
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
