<template>
  <a-table
    :row-selection="rowSelection"
    size="middle"
    :rowKey="rowKey"
    :loading="loading"
    :columns="columns"
    :data-source="data"
    :scroll="{ x: true }"
  >
    <!-- slot="header" 是插入别人的插槽 -->
    <template v-for="slotName in slots" :key="slotName" #[slotName]="data">
      <slot :name="slotName" v-bind="data"></slot>
    </template>
  </a-table>
</template>

<script lang="ts">
import { toRefs } from "@vueuse/core";
import { defineComponent, PropType } from "vue";
type TColumn = {
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: "left" | "right";
  slots?: {
    customRender: string;
  };
};
type DataType = {
  key: string;
  name: string;
  age: number;
  address: string;
};
export default defineComponent({
  props: {
    rowKey: String,
    data: {
      type: Array,
    },
    columns: {
      type: Array as PropType<TColumn[]>,
    },
    loading: {
      type: Boolean,
    },
  },
  setup(props) {
    function useData() {
      // 不能通过props 传递个ref 然后 .value = 赋值改了的话就没有响应式了 , 需要toRef 改成响应父组件的的
      const { loading, data } = toRefs(props);
      const { rowKey, columns } = props;
      // 从 column 里面算出要slot 的
      const slots = columns
        ?.filter((i) => i.slots)
        .map((i) => i.slots?.customRender);
      const rowSelection = {
        onChange: (selectedRowKeys: string[], selectedRows: DataType[]) => {
          console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
          );
        },
        getCheckboxProps: (record: DataType) => ({
          disabled: record.name === "Disabled User", // Column configuration not to be checked
          name: record.name,
        }),
      };
      return {
        slots,
        rowKey,
        columns,
        rowSelection,
        data,
        loading,
      };
    }
    return {
      ...useData(),
    };
  },
});
</script>

<style scoped>
.ant-table td {
  white-space: nowrap;
}
</style>