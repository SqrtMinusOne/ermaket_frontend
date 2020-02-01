import Vue from 'vue'
import './class-component-hooks'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

// tslint:disable-next-line:no-var-requires
const datePicker = require('vue-bootstrap-datetimepicker')
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
// TODO 19-01-20 22:15:01 extract only necessary for production
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)
dom.watch()

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(datePicker)

import TableComponent from '@/components/Table.vue'
Vue.component('TableComponent', TableComponent)

store.dispatch('user/fetchUser').then(() => {
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app')
})
