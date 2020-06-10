import Vue from 'vue'
import VueRouter, { RouteConfig, Route, RawLocation } from 'vue-router'
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
    name: 'unauth_root',
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

class SafeRouter extends VueRouter {
  public async push(location: RawLocation) {
    try {
      const route = await super.push(location)
      return route
    } catch (err) {
      if (err?.name !== 'NavigationDuplicated') {
        throw err
      } else {
        return this.currentRoute
      }
    }
  }
}

const router = new SafeRouter({
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
