import type { MenuModule } from '/@/router/types.d';

const menu: MenuModule[] = [
  {
    orderNo: 1,
    menu: {
      name: 'routes.dashboard.dashboard',
      path: '/dashboard',
      children: [
        {
          path: '/workbench',
          name: 'routes.dashboard.workbench',
        },

        // {
        //   path: '/welcome',
        //   name: 'routes.dashboard.welcome',
        // },
      ],
    },
  },
];
export default menu;
