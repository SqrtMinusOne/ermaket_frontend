import { Getters, Mutations, Actions, Module, createMapper } from 'vuex-smart-module'
import { User, Hierarchy, HierarchyElem } from '@/store/types'
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

  get hierarchyElem() {
    return (id: number): HierarchyElem | undefined => {
      if (this.state.hierarchy) {
        return this.state.hierarchy.hierarchy.find((elem: HierarchyElem) => elem.id === id)
      }
    }
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

  public reset () {
      const s: any = new UserState()
      Object.keys(s).forEach((key: any) => {
        (this.state as any)[key] = s[key]
      })
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
      this.mutations.reset()
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
    try {
      await UserAPI.logout()
    } finally {
      this.mutations.reset()
    }
  }
}

export const user = new Module({
  state: UserState,
  getters: UserGetters,
  mutations: UserMutations,
  actions: UserActions,
})

export const userMapper = createMapper(user)
