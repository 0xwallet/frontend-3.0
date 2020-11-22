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
      component: () => import('/@/views/disk/share/share.vue'),
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
    {
      path: '/shareFile/:uri',
      name: 'ShareFile',
      component: () => import('/@/views/disk/share/shareFile.vue'),
      meta: {
        title: '文件分享',
      },
    },
  ],
} as AppRouteModule;
