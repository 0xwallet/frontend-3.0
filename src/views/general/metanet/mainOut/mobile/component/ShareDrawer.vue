<template>
  <div>
    <BasicDrawer
      @register="register"
      v-bind="$attrs"
      placement="bottom"
      :closable="false"
      :height="350"
      destroyOnClose
      :headerStyle="{ display: 'none' }"
      :bodyStyle="{ background: 'transparent' }"
      id="drawer"
    >
      <div class="grid grid-cols-1 gap-4">
        <div class="h-55 bg-white rounded-xl flex flex-col divide-y-2"
          ><div>
            <div class="m-3" @click="download"
              ><Icon icon="feather:download-cloud" :size="25" class="ml-5" />
              <span class="ml-4 font-semibold">{{ t('downloadButton') }}</span></div
            >
          </div>
          <div>
            <div class="m-3" @click="save"
              ><Icon icon="ant-design:save-outlined" :size="25" class="ml-5" />
              <span class="ml-4 font-semibold">{{ t('saveButton') }}</span></div
            >
          </div>

          <div>
            <div class="m-3" @click="collect"
              ><Icon icon="uil:favorite" :size="25" class="ml-5" />
              <span class="ml-4 font-semibold">{{ t('collectionButton') }}</span></div
            > </div
          ><div>
            <div class="m-3" @click="login"
              ><Icon icon="mdi:login-variant" :size="25" class="ml-5" />
              <span class="ml-4 font-semibold">{{ t('login') }}</span></div
            >
          </div>
        </div>
        <div class="h-10 bg-white rounded-xl flex justify-center" @click="closeDrawer">
          <div class="self-center font-semibold text-center">{{ t('cancel') }}</div>
        </div>
      </div>
    </BasicDrawer>
    <CollectModal @register="registerCollectModal" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, nextTick, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useI18n } from '/@/hooks/web/useI18n';
  import router from '/@/router';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useModal } from '/@/components/Modal';
  import { CollectModal, NetFile } from '/@/components/NetFile';
  import { propTypes } from '/@/utils/propTypes';
  import { Icon } from '/@/components/Icon';
  import { Divider } from 'ant-design-vue';
  import { CheckToken } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicDrawer, CollectModal, Icon, Divider },
    props: {
      file: propTypes.object.def({}),
    },
    setup(props) {
      const file: NetFile = computed(() => {
        return props.file;
      });
      const code = ref('');
      const [register, { closeDrawer }] = useDrawerInner((data) => {
        code.value = data.code;
        nextTick(() => {
          const drawer = document.getElementById('drawer');
          if (drawer) {
            const content = drawer.getElementsByClassName('ant-drawer-content');
            if (content[0]) content[0].style.background = 'transparent';
          }
        });
      });
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
        if (!CheckToken()) return;
        openCollectModal(true, { mode: 'share', id: file.value.shareInfo.id, code: code.value });
        closeDrawer();
      }
      async function login() {
        await router.push(PageEnum.BASE_LOGIN);
      }

      return {
        register,
        download,
        save,
        collect,
        t,
        login,
        registerCollectModal,
        closeDrawer,
      };
    },
  });
</script>
