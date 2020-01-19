import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Login from '@/views/Login.vue'
import Error404 from '@/views/404.vue'

import LoggedInRoutes from './logged_in'
import store from '@/store/index'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  ...LoggedInRoutes.routes,
  {
    path: '*',
    name: '404',
    component: Error404
  }
]


const router = new VueRouter({
  mode: 'history',
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['user/isLoggedIn']) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
