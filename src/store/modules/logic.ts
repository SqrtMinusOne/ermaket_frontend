import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
} from 'vuex-smart-module'
import { Vue } from 'vue-property-decorator'

import LogicAPI from '@/api/logic'
import { LogicResponse, Message, SystemModal } from '@/types/logic'
import { AxiosResponse, AxiosError } from 'axios'
import _ from 'lodash'

/* tslint:disable:max-classes-per-file */

class LogicState {
  public messages: Message[] = []
  public systemModal?: SystemModal
}

class LogicGetters extends Getters<LogicState> {}

class LogicMutations extends Mutations<LogicState> {
  public reset() {
    const s: any = new LogicState()
    Object.keys(s).forEach((key: any) => {
      ;(this.state as any)[key] = s[key]
    })
  }

  public addMessages(messages: Message[]) {
    this.state.messages.push(...messages)
  }

  public openModal(modal: SystemModal) {
    Vue.set(this.state, 'systemModal', modal)
  }

  public onCloseModal() {
    Vue.set(this.state, 'systemModal', undefined)
  }

  public closeMessage(index: number) {
    this.state.messages.splice(index, 1)
    this.state.messages = [...this.state.messages]
  }
}

class LogicActions extends Actions<
  LogicState,
  LogicGetters,
  LogicMutations,
  LogicActions
> {
  public async processCallScript({ scriptId, data } : { scriptId: number, data: any }) {
    try {
      const response = await LogicAPI.execute(scriptId, data)
      return this.actions.processLogic(response)
    } catch (err) {
      await this.actions.processLogicError(err)
      return false
    }
  }

  public async processLogic(response: AxiosResponse<LogicResponse>) {
    if (_.isNil(response.data.businessLogic)) {
      return true
    }
    if (!_.isNil(response.data.businessLogic.messages)) {
      this.mutations.addMessages(response.data.businessLogic.messages)
    }
    return true
  }

  public async processLogicError(
    err: AxiosError<LogicResponse>,
  ) {
    if (_.isNil(err.response) || _.isNil(err.response.data.businessLogic)) {
      throw err
    }
    return this.actions.processLogic(err.response)
  }

  public async safeProcessLogicError(err: AxiosError<LogicResponse>) {
    if (_.isNil(err.response) || _.isNil(err.response.data.businessLogic)) {
      return err
    }
    return this.actions.processLogic(err.response)
  }
}

export const logic = new Module({
  state: LogicState,
  getters: LogicGetters,
  mutations: LogicMutations,
  actions: LogicActions,
})

export const logicMapper = createMapper(logic)
