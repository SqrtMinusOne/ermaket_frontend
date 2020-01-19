import { RouterOptions } from 'vue-router'

import Home from '@/views/Home.vue'

export default class LoggedInRoutes implements RouterOptions {
  public static routes = [
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
  ].map((route) => ({
    ...route,
    meta: {
      requiresAuth: true,
    },
  }))
}
