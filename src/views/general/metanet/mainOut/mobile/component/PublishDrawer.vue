<template>
  <div>
  <BasicDrawer
    @register="register"
    v-bind="$attrs"
    title="title"
    placement="bottom"
    :closable="false"
    :height="300"
    destroyOnClose
  >
    <div class="row">
      <Space direction="vertical">
        <div
          ><Button type="link" @click="download">{{ t('downloadButton') }}</Button>
        </div>
        <!--        <div-->
        <!--          ><Button type="link" @click="save">{{ t('saveTo') }}</Button></div-->
        <!--        >-->
        <div
          ><Button type="link" @click="collect">{{ t('collectionButton') }}</Button></div
        >
        <div
          ><Button type="link">{{ t('showComment') }}</Button></div
        >
        <div
          ><Button type="link" @click="login">{{ t('login') }}</Button></div
        ></Space
      >
    </div>
  </BasicDrawer>
  <CollectModal @register="registerCollectModal" /></div>
</template>
<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Space, Button } from 'ant-design-vue';
  import {CollectModal,NetFile} from "/@/components/NetFile";
  import { useI18n } from '/@/hooks/web/useI18n';
  import router from '/@/router';
  import { PageEnum } from '/@/enums/pageEnum';
  import {useModal} from "/@/components/Modal";
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicDrawer, Space, Button,CollectModal },
    props: {
      file: {
        type: Object,
        default: null,
      },
    },
    setup(props) {
      const file: NetFile = computed(() => {
        return props.file;
      });

      const [register, { closeDrawer }] = useDrawerInner();
      async function download() {
        await file.value.download();
        closeDrawer();
      }
      async function save() {
        await file.value.save();
        closeDrawer();
      }
      const [registerCollectModal, { openModal: openCollectModal }] = useModal();
      async function collect() {
        openCollectModal(true,{mode:'publish',id:file.value.publishInfo.id})
        closeDrawer();
      }
      async function login() {
        await router.replace(PageEnum.BASE_LOGIN);
      }
      return {
        register,
        download,
        save,
        collect,
        t,
        login,registerCollectModal
      };
    },
  });
</script>
<style>
  .row {
    width: 100%;
    display: flex;
    display: -webkit-flex; /* Safari */
  }
</style>
