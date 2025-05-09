import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ant-design:shop-outlined',
      keepAlive: true,
      order: 1000,
      title: '市场应用',
      perms: ['admin', 'sys:market'],
    },
    name: 'sys:market',
    path: '/sys/market',
    children: [
      {
        meta: {
          icon: 'ant-design:appstore-outlined',
          title: '应用管理',
          perms: ['admin', 'sys:market:application'], // 拥有权限码才能访问
        },
        name: 'sys:market:application',
        path: '/market/application/index',
        component: () => import('#/views/market/application/index.vue'),
      },
    ],
  },
];

export default routes;
