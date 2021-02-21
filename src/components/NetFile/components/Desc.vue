<template>
  <div class="grid grid-cols-6 gap-4">
    <div class="col-start-1 col-end-6">
      <template v-if="!edit" v-for="(v, i) in descFormat" :key="i">
        <span v-if="!checkTag(v)">{{ v }} &nbsp;</span>
        <Tag v-if="checkTag(v)" color="#f50">{{ v.replace(/#/g, '') }}</Tag>
      </template>
      <InputTextArea v-model:value="desc" v-if="edit" />
    </div>
    <div class=""
      ><Button type="link" @click="openEdit" v-if="!edit"><EditOutlined /></Button>
      <div class="TextArea" v-if="edit"
        ><Button type="link" @click="closeEdit"><CloseOutlined /></Button>
        <Button type="link" @click="changeDesc"><CheckOutlined /></Button
      ></div>
    </div>
  </div>
  <!--  <div class="desc" v-if="!edit"-->
  <!--    >{{ descFormat }}-->
  <!--    <Button type="link" @click="openEdit"><EditOutlined /></Button>-->
  <!--  </div>-->
  <!--  <div v-if="edit"-->
  <!--    ><InputTextArea v-model:value="desc" />-->
  <!--    <div class="TextArea"-->
  <!--      ><Button type="link" @click="closeEdit"><CloseOutlined /></Button>-->
  <!--      <Button type="link" @click="changeDesc"><CheckOutlined /></Button-->
  <!--    ></div>-->
  <!--  </div>-->
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';

  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMutation } from '@vue/apollo-composable';
  import { NetGql } from '/@/components/NetFile';
  import { EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons-vue';
  import { Button } from '/@/components/Button';
  import { Input, Tag } from 'ant-design-vue';
  const { t } = useI18n('general.metanet');
  const { clipboardRef, copiedRef } = useCopyToClipboard();
  const { createMessage } = useMessage();
  export default defineComponent({
    components: {
      EditOutlined,
      CloseOutlined,
      CheckOutlined,
      Button,
      InputTextArea: Input.TextArea,
      Tag,
    },
    props: {
      desc: propTypes.string,
      id: propTypes.string,
    },
    setup(props) {
      const descFormat = computed(() => {
        return props.desc.split(' ').filter((v) => v.trim());
      });
      const edit = ref(false);
      const desc = ref('');
      function openEdit() {
        desc.value = props.desc;
        edit.value = true;
      }
      function closeEdit() {
        edit.value = false;
      }
      const { mutate: editDesc } = useMutation(NetGql.Basic.Desc);
      async function changeDesc() {
        console.log(desc.value);
        await editDesc({ description: desc.value, userFileId: props.id });
        edit.value = false;
        // emit('refetch');
      }
      function checkTag(v) {
        return v.match(/#(.*)#/);
      }
      return {
        t,
        descFormat,
        desc,
        edit,
        openEdit,
        closeEdit,
        changeDesc,
        checkTag,
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>