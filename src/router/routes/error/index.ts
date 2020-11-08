import type { AppRouteRecordRaw } from '@/router/types';

const routes: AppRouteRecordRaw = {
    path: '/:error*',
    name: '404',
    props: true,
    component: () => import('@/components/error/err404.vue'),
    meta: {
    }
};
    
export default routes;