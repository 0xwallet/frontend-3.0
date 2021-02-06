<template>
  <Card :tab-list="tabList" :active-tab-key="key" @tabChange="(key) => onTabChange(key, 'key')">
    <template #title>
      <span>{{ info.fullName !== undefined ? info.fullName[info.fullName.length - 1] : '' }} </span>
    </template>
    <template #customRender="item">
      <span> {{ item.key }} </span>
    </template>

    <template #extra>
      <a-button type="link" @click="close"
        ><CloseSquareOutlined :style="{ fontSize: '20px' }"
      /></a-button>
    </template>
    <template v-if="key === 'detail'">
      <Descriptions :column="1">
        <DescriptionsItem :label="t('url')"
          ><a-button type="link" @click="copyUrl">{{ info.uri }}</a-button>
        </DescriptionsItem>
        <DescriptionsItem label="Hash" v-if="info.hash"
          ><Hash :hash="info.hash"
        /></DescriptionsItem>
        <DescriptionsItem :label="t('type')">{{ info.type }}</DescriptionsItem>
        <DescriptionsItem :label="t('size')"
          >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('storage')"
          >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('location')">{{ getLocation(info.fullName) }}</DescriptionsItem>
        <DescriptionsItem :label="t('modified')">{{
          formatToDate(info.updatedAt)
        }}</DescriptionsItem>
        <DescriptionsItem :label="t('opened')"></DescriptionsItem>
        <DescriptionsItem :label="t('created')">{{
          formatToDate(info.createdAt)
        }}</DescriptionsItem>
      </Descriptions>
    </template>
    <template v-if="key === 'version'">
      <List item-layout="horizontal" :data-source="info.history">
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
      </List>
    </template>
  </Card>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions, List } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');
  import { byteTransfer } from '/@/utils/disk/file';
  import { CloseSquareOutlined } from '@ant-design/icons-vue';
  import { propTypes } from '/@/utils/propTypes';
  import Hash from '/@/components/NetFile/components/Hash.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { driveChangePublishVersion } from '/@/hooks/apollo/gqlFile';
  import { formatToDate } from '/@/utils/dateUtil';

  export default defineComponent({
    name: 'FileInfo',
    components: {
      Tabs,
      TabPane: Tabs.TabPane,
      Card,
      Descriptions,
      DescriptionsItem: Descriptions.Item,
      CloseSquareOutlined,
      Hash,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
    },
    props: {
      file: propTypes.any,
    },
    setup(props, { emit }) {
      const info: NetFile = computed(() => {
        return props.file;
      });
      const key = ref('version');
      const tabList = [
        {
          key: 'version',
          tab: t('version'),
        },

        {
          key: 'activity',
          tab: t('activity'),
        },
      ];
      const desc = [
        {
          label: 'type',
          data: 'type',
        },
      ];
      function onTabChange(k) {
        key.value = k;
      }
      function getLocation(dir: string[] = []) {
        if (dir.length == 1) {
          return 'ROOT';
        }
        return dir;
      }
      function close() {
        emit('close');
      }
      function copyUrl() {
        info.value.copyShareUrl(1);
      }

      const { mutate: PublishChangeVerison } = useMutation(driveChangePublishVersion);
      async function changeVersion(publishHistoryId) {
        await PublishChangeVerison({
          id: info.value.publishId,
          publishHistoryId,
        });
        emit('refetch');
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
        close,
        copyUrl,
        changeVersion,
        formatToDate,
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 10px;
  }
</style>
