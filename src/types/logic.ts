import { FormDescription } from './user'

export interface LogicResponse {
  businessLogic?: LogicData
}

export interface LogicData {
  messages?: Message[]
}

export interface Message {
  message: string
  variant: string
}

export enum SystemModal {
  regToken = 'regToken'
}
