import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 3,
  menu: {
    name: '历史',
    path: '/history',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/payment',
        name: '支付',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/settlement',
        name: '结算',
      },
      {
        path: '/activity',
        name: '审计',
      },
    ],
  },
};
export default menu;
