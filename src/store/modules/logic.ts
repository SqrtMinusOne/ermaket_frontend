import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
} from 'vuex-smart-module'

import { LogicResponse, Message } from '@/types/logic'
import { AxiosResponse, AxiosError } from 'axios'
import _ from 'lodash'

/* tslint:disable:max-classes-per-file */

class LogicState {
  public messages: Message[] = []
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
    try {
      return this.actions.processLogicError(err)
    } catch (err) {
      return err
    }
  }
}

export const logic = new Module({
  state: LogicState,
  getters: LogicGetters,
  mutations: LogicMutations,
  actions: LogicActions,
})

export const logicMapper = createMapper(logic)
