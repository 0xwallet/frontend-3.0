import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHashHistory } from 'vue-router';

import { basicRoutes } from './routes';

const router = createRouter({
    history: createWebHashHistory(),
    routes: basicRoutes as RouteRecordRaw[],
    // scrollBehavior: async (to, from, savedPosition) => {
    // }
  });

 export default router; 