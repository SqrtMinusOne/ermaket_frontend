import Vue from 'vue'
import './class-component-hooks'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

store.dispatch('user/fetchUser')

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
