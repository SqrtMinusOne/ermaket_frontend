import { AxiosPromise } from 'axios'
import { DefaultResponse } from '@/types/user'
import { http } from '@/axios-common'

export interface SQLResponse extends DefaultResponse {
  keys: string[]
  res: any[][]
}

export default class SqlAPI {
  public static sendRequest(query: string) {
    return http.post('/sql/execute', { query })
  }
}
