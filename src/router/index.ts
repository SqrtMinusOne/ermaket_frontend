import Vue from 'vue'
import VueRouter, { RouteConfig, Route } from 'vue-router'
import UnAuthHome from '@/views/UnAuthHome.vue'
import Error404 from '@/views/404.vue'

import LoginForm from '@/components/system_forms/LoginForm.vue'
import SignUpForm from '@/components/system_forms/SignUpForm.vue'

import LoggedInRoutes from './logged_in'
import store from '@/store/index'

Vue.use(VueRouter)

const handleIndex = (to: Route, from: Route, next: any) => {
  console.log(to)
  if (!store.getters['user/isLoggedIn'] && to.fullPath === '/') {
    next({
      path: '/login'
    })
  } else {
    next()
  }
}

const routes: RouteConfig[] = [
  {
    path: '/',
    component: UnAuthHome,
    children: [
      {
        path: '/',
        name: 'login_home',
        component: LoginForm,
      },
      {
        path: '/login',
        name: 'login',
        component: LoginForm,
      },
      {
        path: '/signup',
        name: 'signup',
        component: SignUpForm,
      },
      {
        path: '/password',
        name: 'password',
        component: SignUpForm,
      }
    ]
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
    if (to.fullPath === '/' && store.getters['user/isLoggedIn']) {
      next({ path: store.getters['user/route'](store.getters['user/home']) })
    } else {
      next()
    }
  }
})

export default router
