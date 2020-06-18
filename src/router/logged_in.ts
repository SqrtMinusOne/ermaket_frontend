import { RouterOptions, RouteConfig } from 'vue-router'
import handleLogic from './logic_handler'

import Changes from '@/views/Changes.vue'
import Error404 from '@/views/404.vue'
import Home from '@/views/Home.vue'
import Table from '@/views/Table.vue'
import SQLConsole from '@/views/SQLConsole.vue'
import Page from '@/views/Page.vue'

export default class LoggedInRoutes implements RouterOptions {
  public static routes = [
    {
      path: '/',
      // name: 'home',
      component: Home,
      children: [
        {
          path: '/table/:id',
          component: Table,
          beforeEnter: handleLogic,
        },
        {
          path: '/pages/:id',
          component: Page,
          beforeEnter: handleLogic,
        },
        {
          path: '/changes',
          component: Changes,
        },
        {
          path: '/system/sql/:id',
          component: SQLConsole,
          beforeEnter: handleLogic,
        },
        {
          path: '*',
          name: '404-logged_in',
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
