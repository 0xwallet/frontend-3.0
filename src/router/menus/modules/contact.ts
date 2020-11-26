import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 2,
  menu: {
    name: '私域',
    path: '/contact',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/organization',
        name: '组织',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/client',
        name: '客户',
      },
      {
        path: '/general',
        name: '全部',
      },
    ],
  },
};
export default menu;
