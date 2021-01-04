<template>
  <Card>
    <template #title>
      <BasicTitle>{{ t('authorityTitle') }}</BasicTitle>
    </template>
    <Card>
      <template #title>
        <div>用于授权第三方应用利用 WebDAV 协议访问文件</div>
        <Description @register="registerDesc" />
      </template>
      <BasicTable @register="registerTable">
        <template #tableTitle
          ><a-button type="primary" @click="addWebdav">{{ t('addApp') }}</a-button></template
        >
      </BasicTable>
    </Card>
    <WebdavModal @register="registerWebdavModal" />
  </Card>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { Card, Divider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Description, useDescription } from '/@/components/Description';
  import { userStore } from '/@/store/modules/user';
  import { useTable, BasicTable } from '/@/components/Table';
  import moment from 'moment';
  import WebdavModal from './component/WebdavModal.vue';
  import { useModal } from '/@/components/Modal';

  console.log(userStore.getUserInfoState);
  export default defineComponent({
    components: {
      BasicTitle,
      Card,
      CardMeta: Card.Meta,
      Divider,
      Description,
      BasicTable,
      WebdavModal,
    },
    setup() {
      const { t } = useI18n('general.security');
      const [registerDesc] = useDescription({
        title: t('example'),
        column: 1,
        data: { uri: 'https://dav.owaf.com/', account: '111', password: `(${t('appPassword')})` },
        schema: [
          { field: 'uri', label: t('addr') },
          { field: 'account', label: t('account') },
          { field: 'password', label: t('password') },
        ],
      });
      const [registerTable] = useTable({
        dataSource: [
          { name: '11', time: moment().format('YYYY-MM-DD'), password: '123456' },
          { name: '22', time: moment().format('YYYY-MM-DD'), password: '123456' },
        ],
        pagination: false,
        bordered: true,
        showIndexColumn: false,
        showTableSetting: false,
        scroll: { y: 1500 },
        columns: [
          { dataIndex: 'name', title: t('appName') },
          { dataIndex: 'time', title: t('authorityTime') },
          { dataIndex: 'password', title: t('appPassword') },
        ],
      });
      const [registerWebdavModal, { openModal }] = useModal();
      function addWebdav() {
        openModal(true);
      }
      return {
        t,
        registerDesc,
        registerTable,
        registerWebdavModal,
        addWebdav,
      };
    },
  });
</script>
<style lang="less" scoped></style>
