<template>
  <div>
    <BasicTable @register="registerTable">
      <template #urlTitle>
        <span>
          {{ t('url') }}
          <BasicHelp class="ml-2" :text="t('copyShare')" />
        </span>
      </template>
      <template #uri="{ record, text }">
        <Tooltip :title="t('copy')"
          ><a-button type="link" @click="copyUrl(record)"> {{ text }}</a-button></Tooltip
        >
      </template>
      <template #expire="{ record, text }">
        <span @click="editExpire(record.shareInfo.id)">{{ getExpired(text) }}</span>
      </template>
      <template #code="{ record, text }">
        <span @click="editCode(record.shareInfo.id)">{{ text }}</span>
      </template>
      <template #action="{ record }">
        <Dropdown>
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem v-if="record.name !== 'deleted'">
                <a-button type="link" color="error" @click="del(record)">{{
                  t('delButton')
                }}</a-button></MenuItem
              >
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #toolbar>
        <Button @click="changeInfo" type="link">
          <ExclamationCircleTwoTone
            :style="{ fontSize: '20px' }"
            :twoToneColor="`#${info.button ? '2E2EFE' : '6E6E6E'}`"
        /></Button>
      </template>
    </BasicTable>
    <FileInfo :info="info" />
    <Modal
      :visible="modal.visible"
      :title="modal.title"
      centered
      @ok="handleSubmit"
      @cancel="closeModal"
    >
      <div class="w-5/6 m-4">
        <BasicForm
          autoFocusFirstItem
          :labelWidth="100"
          :schemas="modal.schemas"
          :show-action-button-group="false"
          ref="formRef" /></div
    ></Modal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, createVNode, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import GIcon from '/@/components/Icon';
  import { getBasicColumns } from './shareData';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { BasicHelp } from '/@/components/Basic';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tooltip, Drawer, Dropdown, Menu, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined, ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { NetGql, NetFile, FileInfo } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';
  import { dateUtil } from '/@/utils/dateUtil';
  import { BasicForm } from '/@/components/Form';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      GIcon,
      BasicHelp,
      Tooltip,
      Drawer,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      FileInfo,
      ExclamationCircleTwoTone,
      Dropdown,
      Button,
      BasicForm,
      Modal,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const info = ref({
        button: false,
        file: {},
        share: true,
      });
      function changeInfo() {
        info.value.button = !info.value.button;
      }

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            if (info.value.file.id == record.id && info.value.button) {
              info.value.file = {};
              return;
            }
            info.value.file = record;
          },
        }),
        pagination: false,
        title: t('share'),
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'shareId',
        showIndexColumn: false,
        scroll: { x: 1000, y: window.innerHeight * 0.7 },
      });

      const { onResult, refetch } = useQuery(NetGql.Share.List, null, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult((res) => {
        const list = res?.data?.driveListShares;
        let temp: NetFile[] = [];
        list.forEach((v) => {
          if (v.userFile) {
            temp.push(new NetFile(v));
          }
          // if (v.userFile === null) {
          //   temp.push({
          //     name: 'deleted',
          //     shareId: v.id,
          //   });
          //   return;
          // }
        });
        tableData.value = temp;
      });

      // fetchData();
      // 删除分享
      async function del(file: NetFile) {
        Modal.confirm({
          title: t('error'),
          icon: createVNode(ExclamationCircleOutlined),
          content: t('delButton') + ' ' + file.fullName + '?',
          centered: true,
          okText: t('yes'),
          cancelText: t('cancelAll'),
          onOk() {
            file
              .delFileShare()
              .then(() => {
                createMessage.success('删除成功');
              })
              .finally(() => {
                refetch();
              });
          },
        });
      }

      const choose = computed(() => {
        return getSelectRowKeys().length !== 0;
      });

      function setSelectedRowKeyList() {
        if (getSelectRowKeys().length !== 0) {
          clearSelectedRowKeys();
          return;
        }
        let arr: string[] = [];
        for (let i = 0; i < getDataSource().length; i++) {
          arr.push(String(i));
        }
        setSelectedRowKeys(arr);
      }
      function clearSelect() {
        clearSelectedRowKeys();
      }
      function copyUrl(record, mode = 1) {
        const f: NetFile = record;
        f.copyShareUrl(mode);
      }
      function getExpired(time: string): string {
        if (dateUtil().isAfter(time) || time == null) {
          return t('expired');
        }
        //@ts-ignore
        const du = dateUtil.duration(dateUtil(time) - dateUtil(), 'ms');
        return du.humanize(true);
      }
      const modal = ref({
        visible: false,
        title: '',
        schemas: [],
        id: '',
      });
      function editExpire(id: string) {
        modal.value.visible = true;
        modal.value.title = '修改过期时间';
        modal.value.schemas = [{ field: 'expiredAt', label: '过期时间', component: 'InputNumber' }];
        modal.value.id = id;
      }
      function editCode(id: string) {
        console.log(id);
        modal.value.visible = true;
        modal.value.title = '修改访问码';
        modal.value.schemas = [{ field: 'code', label: '访问码', component: 'Input' }];
        modal.value.id = id;
      }

      const formRef = ref({});
      const { mutate: Edit } = useMutation(NetGql.Share.Edit);
      async function handleSubmit() {
        const form = unref(formRef);
        if (!form) return;
        const data = await form.validateFields();
        console.log(data);
        await Edit({ id: modal.value.id, ...data });
        await refetch();
        modal.value.visible = false;
      }
      function closeModal() {
        modal.value.visible = false;
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        clearSelect,
        choose,
        path,
        del,
        copyUrl,
        refetch,
        t,
        changeInfo,
        getExpired,
        editExpire,
        editCode,
        modal,
        info,
        handleSubmit,
        closeModal,
        formRef,
      };
    },
  });
</script>
