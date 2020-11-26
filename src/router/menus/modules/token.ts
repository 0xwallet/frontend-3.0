import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 1,
  menu: {
    name: '通证',
    path: '/token',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/issuer',
        name: '发行',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/management',
        name: '管理',
      },
      {
        path: '/wallet',
        name: '钱包',
      },
    ],
  },
};
export default menu;
