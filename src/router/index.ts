import type { RouteRecordRaw } from 'vue-router';

import { getItem } from 'localforage';
import { createRouter, createWebHashHistory } from 'vue-router';

import { basicRoutes } from './routes';

const router = createRouter({
    history: createWebHashHistory(),
    routes: basicRoutes as RouteRecordRaw[]
    // scrollBehavior: async (to, from, savedPosition) => {
    // }
  });
router.beforeEach((to, from, next) => {
  if (getItem('wallet')) {
    next();
  } else {
    next('login')
  }
})
 export default router; 