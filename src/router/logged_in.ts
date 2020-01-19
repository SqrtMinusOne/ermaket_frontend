import { RouterOptions, RouteConfig } from 'vue-router'

import Home from '@/views/Home.vue'
import Table from '@/views/Table.vue'
import Error404 from '@/views/404.vue'

export default class LoggedInRoutes implements RouterOptions {
  public static routes = [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: '/table/:id',
          component: Table,
        },
        {
          path: '*',
          name: '404',
          component: Error404,
        },
      ],
    },
  ].map((route) => ({
    ...route,
    meta: {
      requiresAuth: true,
    },
  }))
}
