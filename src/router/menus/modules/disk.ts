import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 10,
  menu: {
    name: '网盘',
    path: '/disk',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/files',
        name: '文件列表',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/share',
        name: '我的分享',
      },
      {
        path: '/recycle',
        name: '回收站',
      },
    ],
  },
};
export default menu;
