import { AxiosPromise } from 'axios'
import { DefaultResponse } from '@/types/user'
import { http } from '@/axios-common'

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

  public static changePassword(
    oldPass: string,
    newPass: string
  ): AxiosPromise<DefaultResponse> {
    return http.put('/auth/password', { old_pass: oldPass, new_pass: newPass })
  }

  public static registrationToken(
    name: string,
    roles?: string[],
    uses?: number,
    timeLimit?: string
  ): AxiosPromise<DefaultResponse> {
    return http.post('/auth/register_token', {
      name,
      roles,
      uses,
      time_limit: timeLimit, // TODO date to string?
    })
  }

  public static resetPasswordToken(
    name: string,
    login: string,
    uses?: number,
    timeLimit?: string
  ): AxiosPromise<DefaultResponse> {
    return http.post('/auth/reset_password_token', {
      name,
      login,
      uses,
      time_limit: timeLimit,
    })
  }

  public static signUp(
    token: string,
    login: string,
    password: string
  ): AxiosPromise<DefaultResponse> {
    return http.post('/auth/register', {
      token,
      login,
      password,
    })
  }

  public static resetPassword(
    token: string,
    login: string,
    password: string
  ): AxiosPromise<DefaultResponse> {
    return http.put('/auth/reset_password', {
      token,
      login,
      password,
    })
  }

  public static logout(): AxiosPromise<DefaultResponse> {
    return http.post('/auth/logout')
  }
}
