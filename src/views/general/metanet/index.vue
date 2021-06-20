<template>
  <div class="px-4 pt-2 pb-6">
    <a-tabs v-model:activeKey="curTabKey">
      <a-tab-pane key="myFile" :tab="$t('metanet.files')" />
      <a-tab-pane key="myShare" :tab="$t('metanet.share')" />
      <a-tab-pane key="myPublish" :tab="$t('metanet.publishTitle')" />
      <a-tab-pane key="myCollect" :tab="$t('metanet.collectionTitle')" />
      <a-tab-pane key="recycle" :tab="$t('metanet.recycle')" />
      <!-- tab 的最右边可以加内容 -->
      <!-- <template #tabBarExtraContent>
        <a-button>Extra Action</a-button>
      </template> -->
    </a-tabs>
    <!-- 内容切换区 -->
    <component :is="curTabComponent"></component>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import TabMyFile from "./components/TabMyFile.vue";
import TabMyCollect from "./components/TabMyCollect.vue";
import TabMyPublish from "./components/TabMyPublish.vue";
import TabMyShare from "./components/TabMyShare.vue";
import TabRecycle from "./components/TabRecycle.vue";
export type ICurrentTabKey =
  | "myFile"
  | "myShare"
  | "myPublish"
  | "myCollect"
  | "recycle";
export default defineComponent({
  components: {
    // icon
    TabMyFile,
    TabMyCollect,
    TabMyPublish,
    TabMyShare,
    TabRecycle,
  },
  setup() {
    function useTab() {
      const curTabKey = ref<ICurrentTabKey>("myFile");
      const mapComponentName: {
        [key in ICurrentTabKey]: string;
      } = {
        myFile: "TabMyFile",
        myPublish: "TabMyCollect",
        myCollect: "TabMyPublish",
        myShare: "TabMyShare",
        recycle: "TabRecycle",
      };
      const curTabComponent = computed(() => {
        return mapComponentName[curTabKey.value];
      });
      return {
        curTabKey,
        curTabComponent,
      };
    }

    return {
      ...useTab(),
    };
  },
});
</script>

<style scoped></style>
