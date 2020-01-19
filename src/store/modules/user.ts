import { Getters, Mutations, Actions, Module, createMapper } from 'vuex-smart-module'
import { User, Hierarchy } from '@/store/types'
import UserAPI from '../../api/user'

/* tslint:disable:max-classes-per-file */

class UserState {
  public user: User | null = null
  public hierarchy: Hierarchy | null = null
  public error: string | null = null
}

class UserGetters extends Getters<UserState> {
  get isLoggedIn() {
    return this.state.user !== null
  }
}

class UserMutations extends Mutations<UserState> {
  public setUser(newUser: User | null) {
    this.state.user = newUser
  }

  public setError(error: string | null) {
    this.state.error = error
  }

  public setHierarchy(hierarchy: Hierarchy | null) {
    this.state.hierarchy = hierarchy
  }
}

class UserActions extends Actions<
  UserState,
  UserGetters,
  UserMutations,
  UserActions
> {
  public async fetchUser() {
    try {
      const response = await UserAPI.current()
      this.mutations.setUser(response.data.user)
      this.mutations.setHierarchy(response.data.hierarchy)
    } catch {
      this.mutations.setUser(null)
      this.mutations.setUser(null)
    }
  }

  public async login(payload: { login: string; password: string }) {
    try {
      const response = await UserAPI.login(payload.login, payload.password)
      await this.actions.fetchUser()
    } catch (err) {
      if (err.response) {
        this.mutations.setError(err.response.data.message)
      } else {
        // tslint:disable-next-line:no-console
        console.error(err)
      }
    }
  }

  public async logout() {
    await UserAPI.logout()
      this.mutations.setUser(null)
      this.mutations.setUser(null)
  }
}

export const user = new Module({
  state: UserState,
  getters: UserGetters,
  mutations: UserMutations,
  actions: UserActions,
})

export const userMapper = createMapper(user)
