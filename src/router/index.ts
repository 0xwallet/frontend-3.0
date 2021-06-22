import { useTitle } from "@vueuse/core";
import { i18n } from "../main";
import { message } from "ant-design-vue";
import { PRODUCT_NAME } from "../const/index";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "../store";
// vue 文件
import Login from "../pages/Login/index.vue";
import Layout from "../pages/Layout.vue";
import GeneralAccount from "../pages/General/Account/index.vue";
import GeneralSecurity from "../pages/General/Security/index.vue";
import GeneralMetanet from "../pages/General/Metanet/index.vue";


const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    meta: {
      needAuth: false,
      title: "signIn",
    },
    component: Login,
  },
  {
    path: "/",
    component: Layout,
    redirect: "/general/metanet",
    children: [
      {
        // GeneralAccount will be rendered inside Layout's <router-view>
        // when /general/account is matched
        // 如果 path 是 / 开头就是根路径
        path: "general/account",
        name: "GeneralAccount",
        meta: {
          needAuth: true,
          title: "account",
        },
        component: GeneralAccount,
      },
      {
        path: "general/metanet",
        name: "GeneralMetanet",
        meta: {
          needAuth: true,
          title: "metanet",
        },
        component: GeneralMetanet,
      },
      {
        path: "general/security",
        name: "GeneralSecurity",
        meta: {
          needAuth: true,
          title: "security",
        },
        component: GeneralSecurity,
      },
    ],
  },
  // {
  //   path: "/about",
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../pages/About.vue"),
  // },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 守卫-登录权限
router.beforeEach((to, from) => {
  // console.log("to.name", to.name);
  if (to.name !== "Login" && to.meta.needAuth && !useUserStore().isLoggedIn) {
    // TODO 路由跳转提示
    // message.error(i18n.global.t("pageLogin.pleaseSignInFirst"));
    return {
      path: "/login",
      replace: true,
      query: {
        redirect: to.path,
      },
    };
  }
});
// 守卫-浏览器标题
router.beforeEach((to, from) => {
  const textPath = `common.${to.meta.title}`;
  useTitle(`${i18n.global.t(textPath)} - ${PRODUCT_NAME}`);
});

export default router;
