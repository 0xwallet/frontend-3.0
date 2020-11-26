import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 4,
  menu: {
    path: '/general',
    name: '通用',

    children: [
      {
        path: '/account',
        name: '账户',
      },
      {
        path: '/security',
        name: '安全',
      },
      {
        path: '/metanet',
        name: '元网',
      },
    ],
  },
};
export default menu;
