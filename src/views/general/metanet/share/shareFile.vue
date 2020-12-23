<template>
  <div class="p-4">
    <Card hoverable v-if="mobile && file.fullName !== undefined">
      <template #cover>
        <img src="/@/assets/images/logo.png" class="img" />
        {{ file.type }}
      </template>
      <template class="ant-card-actions" #actions>
        <a-button type="primary" @click="preview(file)">预览</a-button>
        <a-button type="primary">保存</a-button>
        <a-button type="primary">评论</a-button>
      </template>
      <CardMeta>
        <template #title> {{ file.fullName[file.fullName.length - 1] }} </template>
        <template #description>
          <p>{{ file.byteTransfer() }}</p>
        </template>
      </CardMeta>
    </Card>
    <div class="footer">
      <a-button>123 </a-button>
      <a-button>123 </a-button>
      <a-button>123 </a-button>
    </div>
    <BasicTable @register="registerTable" v-if="!mobile">
      <template #name="{ record }">
        <GIcon
          :icon="record.type === 'folder' ? 'bx-bx-folder' : 'bx-bxs-file-' + record.type"
          size="30"
        >
        </GIcon>

        <a-button type="link" @click="openFile(record)"
          >{{ record.name }}{{ record.type === 'folder' ? '' : '.' + record.type }}</a-button
        >
      </template>
      <template #action="{ record }">
        <div>
          <!--          <a-button type="link" v-if="record.type !== 'folder'">详情</a-button>-->
          <a-button type="link" v-if="record.type !== 'folder'" @click="preview(record)"
            >预览</a-button
          >
          <!--          <a-button type="link">复制路径</a-button>-->
          <a-button type="link" @click="download(record)">下载</a-button>
          <a-button
            type="link"
            color="error"
            :pop="{ title: '删除' + record.fullName + '?' }"
            @click="del(record)"
            >删除</a-button
          ></div
        >
      </template>

      <template #toolbar>
        <a-button type="primary" @click="setSelectedRowKeyList">
          {{ !choose ? '全选' : '取消' }}
        </a-button>
        <a-button type="primary" v-show="choose"> 下载 </a-button>
      </template></BasicTable
    >
    <ShareFileModal @register="registerModal" @pushCode="pushCode" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref, nextTick, onMounted, UnwrapRef } from 'vue';
  import { Card } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveFindShare } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ShareFileModal from './ShareFileModal.vue';
  import { useModal } from '/@/components/Modal';
  import { File } from '../type/file';
  import { useTable, BasicTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  export default defineComponent({
    name: 'TestTab',
    components: {
      ShareFileModal,
      BasicTable,
      Card,
      CardMeta: Card.Meta,
    },
    setup() {
      const { currentRoute } = useRouter();
      const params = computed(() => {
        return unref(currentRoute).query;
      });
      const mobile = computed(() => {
        return (
          navigator.userAgent.match(
            /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
          ) !== null
        );
      });
      const file = (ref({}) as unknown) as File;
      const tableData = ref([]);
      const { createMessage, createErrorModal } = useMessage();
      const [registerModal, { openModal }] = useModal();
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        title: '文件列表',
        dataSource: (tableData as unknown) as any[],
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        rowSelection: {
          type: 'checkbox',
        },
        scroll: { x: 1000, y: 800 },
      });

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
      // onMounted(() => {
      //   // nextTick(() => {
      //   //   setTimeout(() => {
      //   //     openModal(true, {}, true);
      //   //   }, 1000);
      //   // });
      // });
      nextTick(() => {
        setTimeout(() => {
          openModal(true, {}, true);
        }, 1000);
      });
      function pushCode(p: { code: string }) {
        params.value.code = p.code;
        fetchData();
      }
      function fetchData() {
        useApollo()
          .query({
            query: driveFindShare,
            variables: params.value,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            const data = res.data?.driveFindShare;
            if (!data) {
              createErrorModal({ title: '错误', content: '分享文件信息错误' });
              return;
            }
            openModal(false);
            const f = new File(data);
            file.value = f;
            console.log(f.hashToStr());
            tableData.value = [f];
          });
      }

      function preview(file: UnwrapRef<File>) {
        file.preview();
      }
      function download(file: File) {
        file.download();
      }
      // 打开文件或者进入目录
      function openFile(f: File) {
        if (!f.isDir) {
          return;
        }
        if (f.type === 'md') {
          // openMDModal(f);
        } else if (f.type === 'png') {
          f.preview();
        }
        return;
      }
      return {
        registerModal,
        registerTable,
        pushCode,
        choose,
        setSelectedRowKeyList,
        clearSelect,
        openFile,
        preview,
        download,
        file,
        mobile,
      };
    },
  });
</script>
<style>
  .img {
    width: 100px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    z-index: 999;
  }
</style>
