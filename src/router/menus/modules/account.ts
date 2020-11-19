import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 99,
  menu: {
    path: '/account',
    name: '个人中心',

    children: [
      {
        path: '/setting',
        name: '设置',
      },
    ],
  },
};
export default menu;
