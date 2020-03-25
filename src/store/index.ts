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
import { progress } from './modules/progress'

Vue.use(Vuex)

/* tslint:disable:max-classes-per-file */

const root = new Module({
  modules: {
    user,
    table,
    logic,
    progress,
  },
})

export default createStore(root)
