import { AxiosPromise } from 'axios'
import { LogicResponse } from '@/types/logic'
import { http } from '@/axios-common'

export default class LogicAPI {
  public static execute(id: number, data: any): AxiosPromise<LogicResponse> {
    return http.post(`/scripts/execute/{id}`, data)
  }
}
