<template>
  <div>
    <!-- 功能区 -->
    <div class="flex items-center mb-4">
      <a-button type="primary" @click="onClickUploadSingle">
        <UploadOutlined class="align-middle pb-1" />
        {{ $t("metanet.uploadButton") }}
      </a-button>
      <input
        class="hidden"
        type="file"
        id="singleInput"
        @change="onChangeSingleUploadFile"
      />

      <!-- <a-upload
        name="file"
        v-model:file-list="fileList"
        :headers="headers"
        :beforeUpload="onBeforeUploadSingle"
        :showUploadList="false"
        @change="handleChange"
      >
        <a-button type="primary">
          <uploadOutlined />
          {{ $t("metanet.uploadButton") }}
        </a-button>
      </a-upload> -->

      <a-button class="ml-2" type="primary">
        <UploadOutlined class="align-middle pb-1" />
        {{ $t("metanet.uploadBatchButton") }}
      </a-button>
      <a-dropdown class="ml-2">
        <template #overlay>
          <a-menu @click="onCreate">
            <a-menu-item key="file">{{ $t("metanet.file") }}</a-menu-item>
            <a-menu-item key="folder">{{ $t("metanet.folder") }}</a-menu-item>
          </a-menu>
        </template>
        <a-button>
          {{ $t("metanet.create") }}
          <DownOutlined class="align-middle" />
        </a-button>
      </a-dropdown>
    </div>
    <TableFiles
      rowKey="id"
      :columns="columns"
      :loading="tableLoading"
      :data="tableData"
    >
      <template #name="{ record }">
        <!-- 空白就是blank 文件夹就是folder -->
        <AppFileTypeIcon
          class="text-3xl align-bottom"
          :type="record.fileType"
        />
        <a-button type="link">
          {{ record.fullName[0] }}
        </a-button>
      </template>
      <template #action>
        <a-button-group size="small">
          <a-button>{{ $t("metanet.downloadButton") }}</a-button>
          <a-button type="danger">{{ $t("metanet.delButton") }}</a-button>
        </a-button-group>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { DownOutlined, UploadOutlined } from "@ant-design/icons-vue";
import TableFiles from "./TableFiles.vue";
import { AppFileTypeIcon } from "@/components";
import { useI18n } from "vue-i18n";
import { apiQueryFileByDir, apiUploadSingle, TFileList } from "@/apollo/api";
import dayjs from "dayjs";
import { assign } from "lodash-es";
import { message } from "ant-design-vue";
import { useUserStore } from "@/store";

export default defineComponent({
  components: {
    // icon
    DownOutlined,
    UploadOutlined,
    //
    TableFiles,
    AppFileTypeIcon,
  },
  setup() {
    const { t } = useI18n();
    function useTool() {
      const onCreate = () => {
        console.log("onCreate");
      };
      return {
        onCreate,
      };
    }
    let getAndSetTableDataFn: () => void;
    function useUploadSingle() {
      // TODO input 上传成功后清除文件?
      const onClickUploadSingle = () => {
        document.getElementById("singleInput")?.click();
      };
      const onChangeSingleUploadFile = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        // input.files[0] =>file
        // lastModified: 1623572088894
        // lastModifiedDate: Sun Jun 13 2021 16:14:48 GMT+0800 (中国标准时间) {}
        // name: "record.md"
        // size: 1916
        // type: ""
        // webkitRelativePath: ""
        console.log("onChangeSingleUploadFile---", input);
        const fileName = file.name;
        // TODO 上传完后清除?
        const [res, err] = await apiUploadSingle({
          File: new Uint8Array(await file.arrayBuffer()),
          // TODO 要带上路径吗
          FullName: [fileName],
          FileSize: file.size,
          UserId: useUserStore().id,
          Space: "PRIVATE",
          Description: "",
          Action: "drive",
        });
        input.value = ""; //释放input 资源
        // 同步添加新的事件监听 然后解除监听
        const hide = message.loading("上传成功,等待websocket 返回确认信息", 0);
        let timer: number;
        const { channel } = useUserStore();
        if (!channel) throw Error("no channel");
        let removeListener = channel.on(
          "file_uploaded",
          (fileUploadInfo: {
            // full_name: ["testTrace.go"]
            // hash: "1e926583a18c6a0a8e26372a5055c9ec748d983c1458c43d125154a74eee7b83"
            // id: "zrEK5LckpjNr2bsRJoT6p0"
            // space: 2
            full_name: string[];
            hash: string;
            id: string;
            space: number;
          }) => {
            // TODO 应该用hash 判断
            if (fileUploadInfo.full_name[0] === fileName) {
              clearTimeout(timer);
              message.success("上传成功");
              if (getAndSetTableDataFn) getAndSetTableDataFn();
              console.log("getAndSetTableDataFn", getAndSetTableDataFn);
              channel.off("file_uploaded", removeListener);
              hide();
            }
          }
        );
        // 设置超时
        timer = window.setTimeout(() => {
          hide();
          message.warn("等待websocket 确认信息 超时");
          channel.off("file_uploaded", removeListener);
          clearTimeout(timer);
        }, 60000);
        // 重新刷新数据?
        if (err) console.error(err);
        console.log("writestream---", res, input);
      };
      return {
        onClickUploadSingle,
        onChangeSingleUploadFile,
      };
    }
    function useTableData() {
      const columns = [
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
          width: 300,
        },
        {
          title: t("metanet.data"),
          dataIndex: "updatedAt",
          customRender: ({ text }: { text: string }) =>
            dayjs(text).format("YYYY-MM-DD"),
          width: 200,
        },
        {
          title: "Hash",
          dataIndex: "hash",
          slots: { customRender: "hash" },
          width: 200,
        },
        {
          title: t("metanet.size"),
          dataIndex: "info.size",
          width: 100,
          customRender: ({
            record,
            text,
          }: {
            record: { isDir: boolean };
            text: string;
          }) => {
            return record.isDir ? "" : text;
          },
        },
        // {
        //   title: t("metanet.type"),
        //   // width: "100px",
        // },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 100,
          slots: { customRender: "action" },
        },
      ];
      const tableLoading = ref(false);
      const tableData = ref<TFileList>([]);
      // 提供一个函数给外部
      getAndSetTableDataFn = () => {
        tableLoading.value = true;
        apiQueryFileByDir({
          dirId: "root",
        }).then(([res, err]) => {
          if (err || !res?.data.driveListFiles) return;
          console.log("网盘文件获取", res);
          const notNullList = res.data.driveListFiles
            .filter((i) => i !== null && i.id !== "root")
            .sort((a) => {
              if (a) return a.isDir ? -1 : 1;
              else return 1;
            });
          tableData.value = notNullList.map((i) => {
            if (!i) return i;
            else {
              const obj = { ...i };
              if (obj.isDir) assign(obj, { fileType: "folder" });
              else {
                const arr = obj.fullName[0].split(".");
                if (arr.length) obj.fileType = arr.pop()?.toLowerCase();
                else obj.fileType = "blank";
              }
              return obj;
            }
          });
          console.log("tabledData", tableData);
          tableLoading.value = false;
        });
      };
      getAndSetTableDataFn();

      return {
        columns,
        tableData,
        tableLoading,
      };
    }
    return {
      ...useUploadSingle(),
      ...useTool(),
      ...useTableData(),
    };
  },
});
</script>
