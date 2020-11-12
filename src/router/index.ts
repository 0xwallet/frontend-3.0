import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHashHistory } from 'vue-router';

import { basicRoutes } from './routes';

const router = createRouter({
  history: createWebHashHistory(),
  routes: basicRoutes as RouteRecordRaw[],
  scrollBehavior: async (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  }
});

 export default router; 