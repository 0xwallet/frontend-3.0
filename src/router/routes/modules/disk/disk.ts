import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

export default {
  layout: {
    path: '/disk',
    name: 'Disk',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/disk/files',
    meta: {
      icon: 'ant-design:home-outlined',
      title: '网盘',
    },
  },

  routes: [
    {
      path: '/files',
      name: 'Files',
      component: () => import('/@/views/disk/index.vue'),
      meta: {
        title: '文件列表',
      },
    },
    {
      path: '/share',
      name: 'Share',
      component: () => import('/@/views/disk/share.vue'),
      meta: {
        title: '我的分享',
      },
    },
    {
      path: '/recycle',
      name: 'Recycle',
      component: () => import('/@/views/disk/recycle.vue'),
      meta: {
        title: '回收站',
      },
    },
  ],
} as AppRouteModule;
