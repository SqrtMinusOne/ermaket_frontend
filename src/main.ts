import Vue from 'vue'
import './class-component-hooks'

/* Vue-Bootstrap */
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

/* Datepicker */
// tslint:disable-next-line:no-var-requires
const datePicker = require('vue-bootstrap-datetimepicker')
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css'

/* Form Generator */
// tslint:disable-next-line:no-var-requires
const VueFormGenerator = require('vue-form-generator')
import 'vue-form-generator/dist/vfg.css'

/* Fonts awesome */
import { library, dom } from '@fortawesome/fontawesome-svg-core'
// TODO 19-01-20 22:15:01 extract only necessary for production
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)
dom.watch()

/* Vue Codemirror */
// tslint:disable-next-line:no-var-requires
const VueCodemirror = require('vue-codemirror')
import 'codemirror/lib/codemirror.css'

/* App */
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(datePicker)
Vue.use(VueFormGenerator)
Vue.use(VueCodemirror)

/* Custom components which have to registered globally for some obscure reasons */
import TableComponent from '@/components/Table.vue'
import fieldDatepicker from '@/components/form/FieldDatepicker.vue'
import fieldLinkedSelect from '@/components/form/FieldLinkedSelect.vue'
import fieldLinkedTableModal from '@/components/form/FieldLinkedTableModal.vue'
import ProfileEntry from '@/components/sidebar/ProfileEntry.vue'
Vue.component('TableComponent', TableComponent)
Vue.component('fieldDatepicker', fieldDatepicker)
Vue.component('fieldLinkedSelect', fieldLinkedSelect)
Vue.component('fieldLinkedTableModal', fieldLinkedTableModal)
Vue.component('ProfileEntry', ProfileEntry)

store.dispatch('user/fetchUser').then(() => {
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app')
})
