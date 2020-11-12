import type { AppRouteRecordRaw } from '@/router/types';
const RootRoute: AppRouteRecordRaw = {
    path: '/',
    name: 'root',
    component: () => import(/* webpackChunkName: "home" */ '@/layouts/default'),
};
    
export default RootRoute;