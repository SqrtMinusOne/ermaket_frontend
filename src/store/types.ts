export interface DefaultResponse {
  ok: boolean
  message?: string
  [key: string]: any
}

export interface User {
  login: string
  roles: string[]
}

export interface Hierarchy {
  [key: string]: any  // TODO
}
