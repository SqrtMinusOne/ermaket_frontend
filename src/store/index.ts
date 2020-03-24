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
import { table } from './modules/table'
import { logic } from './modules/logic'

Vue.use(Vuex)

/* tslint:disable:max-classes-per-file */

const root = new Module({
  modules: {
    user,
    table,
    logic,
  },
})

export default createStore(root)
