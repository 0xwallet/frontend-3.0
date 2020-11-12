import type { AppRouteRecordRaw } from '@/router/types';

const routes: AppRouteRecordRaw = {
    path: '/frontend/:type',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/user/login/index.vue'),
    props: true,
    meta: {
        title: '登录',
    }
};
    
export default routes;