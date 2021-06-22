<template>
  <div class="w-full h-full">
    <a-layout
      hasSider
      prefixCls="ant-layout"
      class="ant-layout"
      :style="{
        height: '100%',
      }"
      id="global-layout-component"
    >
      <!-- 左边菜单区 -->
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
        <!-- logo -->
        <div id="siderLogoBox" class="flex h-12 items-center justify-center">
          <div id="siderLogoSvg" v-html="svgLogoStr"></div>
          <div id="siderLogoText" class="text-white text-lg font-bold pl-3">
            {{ PRODUCT_NAME }}
          </div>
        </div>
        <!-- 切换黑白主题 -->
        <!-- :inline-collapsed="collapsed" -->
        <a-menu
          mode="inline"
          theme="dark"
          :inline-collapsed="collapsed"
          v-model:openKeys="openKeys"
          v-model:selectedKeys="selectedKeys"
          @click="onMenuSelect"
        >
          <!-- <a-menu-item key="1">
            <PieChartOutlined />
            <span>Option 1</span>
          </a-menu-item> -->
          <!-- <a-sub-menu key="sub1">
            <template #title>
              <span class="flex items-center">
                <MailOutlined />
                <span>Navigation One</span>
              </span>
            </template>
            <a-menu-item key="5">Option 5</a-menu-item>
            <a-menu-item key="6">Option 6</a-menu-item>
            <a-menu-item key="7">Option 7</a-menu-item>
            <a-menu-item key="8">Option 8</a-menu-item>
          </a-sub-menu> -->
          <a-sub-menu key="general">
            <template #title>
              <span class="flex items-center">
                <AppstoreAddOutlined />
                <span>{{ $t("common.GENERAL") }}</span>
              </span>
            </template>
            <!-- TODO 跟路由相关联 v-for -->
            <a-menu-item key="account">{{ $t("common.account") }}</a-menu-item>
            <a-menu-item key="metanet">{{ $t("common.metanet") }}</a-menu-item>
            <a-menu-item key="security">{{
              $t("common.security")
            }}</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout prefixCls="ant-layout">
        <a-layout-header class="flex items-center bg-white px-0 h-12">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <!-- 面包屑 sub/item -->
          <a-breadcrumb class="inline-block">
            <a-breadcrumb-item>
              <a href="javascript:void(0)">{{
                $t(`common.${computedBreadcrumpObj.subKey}`)
              }}</a>
              <template #overlay>
                <a-menu>
                  <a-menu-item
                    v-for="item in computedBreadcrumpObj.subMenuItems"
                    :key="item.path"
                  >
                    <router-link :to="item.path">{{
                      $t(`common.${item.meta.title}`)
                    }}</router-link>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-breadcrumb-item>
            <a-breadcrumb-item>{{
              $t(`common.${computedBreadcrumpObj.curRouteTitle}`)
            }}</a-breadcrumb-item>
          </a-breadcrumb>
          <!-- 撑开中间 -->
          <div class="flex-1"></div>
          <div class="flex items-center h-full px-4">
            <AppLocaleSwither class="text-base text-gray-600 localeSwitcher" />
          </div>
          <!-- <div class="px-2 mr-4 h-full flex items-center cursor-pointer"> -->
          <!-- </div> -->

          <!-- 头像 用户名 -->
          <!-- <a-avatar :size="24" class="leading-8">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="pl-2">{{ username }}</span> -->

          <a-dropdown placement="bottomRight">
            <div
              class="
                px-2
                mr-4
                h-full
                flex
                items-center
                cursor-pointer
                hover:bg-gray-100
              "
            >
              <a-avatar :size="24" class="leading-8">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="pl-2">{{ username }}</span>
            </div>
            <template #overlay>
              <a-menu @click="onAvatarDropdownMenuClick">
                <a-menu-item class="flex items-center">
                  <LogoutOutlined />{{ $t("common.dropdownItemLoginOut") }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-layout-header>
        <a-layout-content
          class="bg-white mx-4 my-6"
          :style="{
            minHeight: '280px',
          }"
        >
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script lang="ts">
import { computed, createVNode, defineComponent, ref, watch } from "vue";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreAddOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { pick } from "lodash-es";
import { useRoute, useRouter } from "vue-router";
import { PRODUCT_NAME } from "@/const";
import { useSvgWhiteLogo } from "@/hooks";
import { AppLocaleSwither } from "@/components";
import { useUserStore } from "@/store";
import { Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";

type TMenuSelect = {
  domEvent: Event;
  item: {
    mode: string;
    eventKey: string;
    // ...
  };
  key: string;
  keyPath: string[];
  selectedKeys: string[];
};
type TBreadcrumb = {
  path: string;
  name: string;
  meta: {
    needAuth: boolean;
    title: string;
  };
};
export default defineComponent({
  components: {
    // icon
    AppstoreAddOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    // ExclamationCircleOutlined,
    //
    AppLocaleSwither,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const { username, signOutAndClear } = useUserStore();
    // console.log("router", router);
    /** logo区域 */
    function useSvgLogo() {
      return { PRODUCT_NAME, svgLogoStr: useSvgWhiteLogo() };
    }
    /** 面包屑区 */
    function useBreadcrumb() {
      const insideRouteObj = router
        .getRoutes()
        .filter((i) => !["/", "/login"].includes(i.path))
        .map((i) => pick(i, ["path", "name", "meta"]) as TBreadcrumb)
        .reduce<{
          [key: string]: TBreadcrumb[];
        }>((acc, cur) => {
          const [s, subKey, itemKey] = cur.path.split("/");
          acc[subKey] = acc[subKey] ? [...acc[subKey], cur] : [cur];
          return acc;
        }, {});
      // general: Array(3)
      // 0: {path: "/general/account", name: "GeneralAccount", meta: {…}}
      // 1: {path: "/general/metanet", name: "GeneralMetanet", meta: {…}}
      // 2: {path: "/general/security
      // console.log("insideRouteObj", insideRouteObj, route);
      // 根据route.path 来computed
      const computedBreadcrumpObj = computed(() => {
        const [s, curRouteSubKey, curRouteKey] = route.path.split("/");
        return {
          // 翻译文件里有  general: "全部" 和  GENERAL: "通用" 这里用大写的
          subKey: curRouteSubKey.toUpperCase(),
          subMenuItems: insideRouteObj[curRouteSubKey],
          curRouteTitle: route.meta.title,
        };
      });
      // console.log("computedBreadcrumpObj", computedBreadcrumpObj);
      return { computedBreadcrumpObj };
    }
    /** 菜单数据 */
    function useLayoutMenu() {
      // console.log("route", route);
      const openKeys = ref([""]);
      const selectedKeys = ref([""]);
      // 观察路由path 改变菜单
      watch(
        () => route.path,
        (pathStr) => {
          // console.log("pathStr", pathStr);
          // /general/account
          const [s, subKey, itemKey] = pathStr.split("/");
          openKeys.value = [subKey];
          selectedKeys.value = [itemKey];
        },
        {
          immediate: true,
        }
      );
      const collapsed = ref(false);
      const onMenuSelect = ({ key, keyPath }: TMenuSelect) => {
        // key: "account"
        // keyPath: (2) ["account", "general"]
        // console.log("选中的菜单key", key, keyPath);
        const toRoute = "/" + keyPath.reverse().join("/");
        // /general/account
        // router.push 会自动判断与当前页面是否重复
        router.push(toRoute);
      };
      return { openKeys, selectedKeys, collapsed, onMenuSelect };
    }
    /** TODO 用api query回来带有头像的数据 */
    function useUserDetailInfo() {
      const onAvatarDropdownMenuClick = () => {
        Modal.confirm({
          icon: createVNode(ExclamationCircleOutlined),
          title: t("common.logoutTip"),
          content: t("common.logoutMessage"),
          onOk: signOutAndClear,
        });
      };
      return {
        username,
        onAvatarDropdownMenuClick,
      };
    }
    return {
      ...useBreadcrumb(),
      ...useLayoutMenu(),
      ...useSvgLogo(),
      ...useUserDetailInfo(),
    };
  },
});
</script>

<style>
#global-layout-component .trigger {
  font-size: 18px;
  /* line-height: 54px; */
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#global-layout-component .trigger:hover {
  color: #1890ff;
}
#global-layout-component .localeSwitcher:hover {
  color: #1890ff;
}
/* 
.site-layout .site-layout-background {
  background: #fff;
} */
</style>

<style lang="less" scoped>
#siderLogoBox {
  transform: translateX(0);
  transition: transform 0.3s ease-out;
}
#siderLogoText {
  display: block;
}
.ant-layout-sider-collapsed {
  #siderLogoText {
    display: none;
  }
  #siderLogoBox {
    transform: translateX(0px);
  }
}

// 面包屑下箭头图标垂直居中
::v-deep .ant-breadcrumb-overlay-link {
  .anticon-down {
    vertical-align: middle;
  }
}
</style>