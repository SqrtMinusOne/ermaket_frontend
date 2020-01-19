import { http } from '@/axios-common'
import { AxiosPromise } from 'axios'
import { DefaultResponse } from '@/store/types'

export default class UserAPI {
  public static login(
    login: string,
    password: string
  ): AxiosPromise<DefaultResponse> {
    return http.post('/auth/login', { login, password })
  }

  public static current(): AxiosPromise {
    return http.get('/auth/current')
  }

  public static logout(): AxiosPromise<DefaultResponse> {
    return http.post('/auth/logout')
  }
}
