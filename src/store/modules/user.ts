import {
  Module,
  VuexModule,
  Mutation,
  Action,
  MutationAction,
} from 'vuex-module-decorators'
import { Dispatch } from 'vuex'
import { User, Hierarchy } from '@/store/types'
import UserAPI from '@/api/user'

@Module
export default class UserStore extends VuexModule {
  public user: User | null = null
  public hierarchy: Hierarchy | null = null
  public error: string | null = null

  @Mutation
  public setUser(user: User | null) {
    this.user = user
  }

  @Mutation
  public setError(error: string | null) {
    this.error = error
  }

  @MutationAction({ mutate: ['user', 'hierarchy'] })
  public async fetchUser() {
    try {
      const reponse = await UserAPI.current()
      return { user: reponse.data.user, hierarchy: reponse.data.hierarchy }
    } catch {
      return { user: null, hierarchy: null }
    }
  }

  @Action({ commit: 'setError' })
  public async login(
    { dispatch }: { dispatch: Dispatch },
    { login, password }: { login: string; password: string }
  ) {
    try {
      const response = await UserAPI.login(login, password)
      dispatch('fetchUser')
      return null
    } catch(err) {
      return err.reponse.data.message
    }
  }
}
