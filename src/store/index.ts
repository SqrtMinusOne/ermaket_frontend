import Vue from 'vue'
import Vuex from 'vuex'

import {
  createStore,
  Module,
  Getters,
  Mutations,
  Actions,
} from 'vuex-smart-module'
import { user } from './modules/user'

Vue.use(Vuex)

/* tslint:disable:max-classes-per-file */

const root = new Module({
  modules: {
    user,
  },
})

export default createStore(root)
