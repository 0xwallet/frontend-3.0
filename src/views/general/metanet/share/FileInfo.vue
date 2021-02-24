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
          >{{ byteTransfer(info.size).value + ' ' + byteTransfer(info.size).unit }} ({{
            info.size
          }}
          bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('storage')"
          >{{ byteTransfer(info.size).value + ' ' + byteTransfer(info.size).unit }} ({{
            info.size
          }}
          bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('location')">{{ getLocation(info.fullName) }}</DescriptionsItem>
        <DescriptionsItem :label="t('modified')">{{
          formatToDate(info.updatedAt)
        }}</DescriptionsItem>
        <DescriptionsItem :label="t('opened')"></DescriptionsItem>
        <DescriptionsItem :label="t('created')">{{
          formatToDate(info.createdAt)
        }}</DescriptionsItem>
        <DescriptionsItem :label="t('shared')" v-if="info.isShared">{{
          t('shared')
        }}</DescriptionsItem>
      </Descriptions>
    </template>
  </Card>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');
  import { byteTransfer } from '/@/utils/disk/file';
  import { CloseSquareOutlined } from '@ant-design/icons-vue';
  import { propTypes } from '/@/utils/propTypes';
  import Hash from '/@/components/NetFile/components/Hash.vue';
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
    },
    props: {
      file: propTypes.any,
    },
    setup(props, { emit }) {
      const info: NetFile = computed(() => {
        console.log(props.file);
        return props.file;
      });
      const key = ref('detail');
      const tabList = [
        {
          key: 'detail',
          tab: t('detail'),
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
