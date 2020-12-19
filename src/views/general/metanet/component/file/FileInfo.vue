<template>
  <Card
    :tab-list="tabList"
    :active-tab-key="key"
    @tabChange="(key) => onTabChange(key, 'key')"
    v-if="info !== {}"
  >
    <template #title>
      <span>{{ info.name }} </span>
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
      {{ info }}
      <Descriptions :column="1">
        <DescriptionsItem :label="t('type')">{{ info.type }}</DescriptionsItem>
        <DescriptionsItem :label="t('size')"
          >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('storage')"
          >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem
        >
        <DescriptionsItem :label="t('location')">{{ getLocation(info.fullName) }}</DescriptionsItem>
        <DescriptionsItem :label="t('modified')">{{
          moment(info.updatedAt).format('lll')
        }}</DescriptionsItem>
        <DescriptionsItem :label="t('opened')"></DescriptionsItem>
        <DescriptionsItem :label="t('created')">{{
          moment(info.createdAt).format('lll')
        }}</DescriptionsItem>
      </Descriptions>
    </template>
  </Card>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { File } from '/@/views/general/metanet/type/file';
  const { t } = useI18n('general.metanet');
  import { byteTransfer } from '/@/utils/disk/file';
  import moment from 'moment';
  import { CloseSquareOutlined } from '@ant-design/icons-vue';
  import { useLocale } from '/@/hooks/web/useLocale';
  import { propTypes } from '/@/utils/propTypes';
  useLocale();
  export default defineComponent({
    name: 'FileInfo',
    components: {
      Tabs,
      TabPane: Tabs.TabPane,
      Card,
      Descriptions,
      DescriptionsItem: Descriptions.Item,
      CloseSquareOutlined,
    },
    props: {
      file: propTypes.any,
    },
    setup(props, { emit }) {
      const info: File = computed(() => {
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
      return { t, info, tabList, key, onTabChange, desc, byteTransfer, moment, getLocation, close };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 10px;
  }
</style>
