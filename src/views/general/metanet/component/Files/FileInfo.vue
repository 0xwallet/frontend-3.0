<template>
  <Tabs>
    <TabPane key="1" :tab="t('basic')">
      <Space direction="vertical">
        <div class="info_header">
          <Icon :type="info.type" :size="100" />
          <p
            >{{ byteTransfer(info.size).value }} {{ byteTransfer(info.size).unit }}({{
              byteTransfer(info.size).unit
            }}ytes)</p
          >
          <p
            >{{ byteTransfer(info.size).value }} {{ byteTransfer(info.size).unit }}({{
              byteTransfer(info.size).unit
            }}ytes)</p
          >
        </div>
        <Divider type="horizontal" />
        <Descriptions :column="1">
          <DescriptionsItem :label="t('type')">{{ info.type }}</DescriptionsItem>
          <DescriptionsItem :label="t('location')">{{
            getLocation(info.fullName)
          }}</DescriptionsItem>
          <DescriptionsItem :label="t('modified')">{{ time(info.updatedAt) }}</DescriptionsItem>
          <DescriptionsItem :label="t('opened')"></DescriptionsItem>
          <DescriptionsItem :label="t('created')">{{ time(info.createdAt) }}</DescriptionsItem>
        </Descriptions>

        {{ info.desc }}
      </Space>
    </TabPane>
    <TabPane key="2" :tab="t('dynamic')">
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
  <!--    <Card :tab-list="tabList" :active-tab-key="key" @tabChange="(key) => onTabChange(key, 'key')">-->
  <!--      <template #customRender="item">-->
  <!--        <span> {{ item.key }} </span>-->
  <!--      </template>-->

  <!--      <template v-if="key === 'basic'">-->
  <!--        <Descriptions :column="1">-->
  <!--          <DescriptionsItem :label="t('desc')">{{ info.desc }}</DescriptionsItem>-->
  <!--          <DescriptionsItem :label="t('type')">{{ info.type }}</DescriptionsItem>-->
  <!--          <DescriptionsItem :label="t('size')"-->
  <!--            >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem-->
  <!--          >-->
  <!--          <DescriptionsItem :label="t('storage')"-->
  <!--            >{{ byteTransfer(info.size) }}({{ info.size }} bytes)</DescriptionsItem-->
  <!--          >-->
  <!--          <DescriptionsItem :label="t('location')">{{-->
  <!--            getLocation(info.fullName)-->
  <!--          }}</DescriptionsItem>-->
  <!--          <DescriptionsItem :label="t('modified')">{{ time(info.updatedAt) }}</DescriptionsItem>-->
  <!--          <DescriptionsItem :label="t('opened')"></DescriptionsItem>-->
  <!--          <DescriptionsItem :label="t('created')">{{ time(info.createdAt) }}</DescriptionsItem>-->
  <!--        </Descriptions>-->
  <!--      </template>-->
  <!--      <template v-if="key === 'dynamic'">-->
  <!--        <List item-layout="horizontal" :data-source="data">-->
  <!--          <template #renderItem="{ item, index }">-->
  <!--            <ListItem>-->
  <!--              <ListItemMeta>-->
  <!--                <template #title>-->
  <!--                  {{ item.title }}-->
  <!--                </template>-->
  <!--                <template #description>-->
  <!--                  {{ item.content }}-->
  <!--                </template>-->
  <!--              </ListItemMeta>-->
  <!--              <div>{{ item.time }}</div>-->
  <!--            </ListItem>-->
  <!--          </template>-->
  <!--        </List>-->
  <!--      </template>-->
  <!--    </Card>-->
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { Tabs, Card, Descriptions, Space, Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');
  import { byteTransfer } from '/@/utils/disk/file';
  import { propTypes } from '/@/utils/propTypes';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { List } from 'ant-design-vue';
  import { Icon } from '/@/components/NetFile';
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
    },
    props: {
      file: propTypes.any,
    },
    setup(props) {
      const info: NetFile = computed(() => {
        return props.file;
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

      function time(t: string): string {
        return formatToDateTime(t, 'YYYY-MM-DD HH:mm:ss');
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

  .info_header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
