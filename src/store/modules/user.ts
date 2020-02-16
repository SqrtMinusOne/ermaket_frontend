import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
} from 'vuex-smart-module'
import { $enum } from 'ts-enum-util'
import {
  User,
  Hierarchy,
  HierarchyElem,
  Access,
  TableLinkType,
  FormLinkType,
  FormDescription,
  Table,
} from '@/types/user'
import {
  instanceOfTable,
  instanceOfForm,
  instanceOfLinkedColumn,
  instanceOfLinkedField,
} from '@/types/user_guards'
import UserAPI from '@/api/user'

/* tslint:disable:max-classes-per-file */

function setEnums(elem: HierarchyElem) {
  for (const access of elem.accessRights) {
    access.access = access.access.map((acc) =>
      $enum(Access).asValueOrThrow(acc)
    )
  }
  if (instanceOfTable(elem)) {
    for (const column of elem.columns) {
      if (instanceOfLinkedColumn(column)) {
        column.linkType = $enum(TableLinkType).asValueOrThrow(column.linkType)
      }
    }
    setEnumsForm(elem.formDescription)
  }
  if (instanceOfForm(elem)) {
    setEnumsForm(elem.formDescription)
  }
}

function setEnumsForm(elem: FormDescription) {
  for (const field of elem.fields) {
    if (instanceOfLinkedField(field)) {
      field.linkType = $enum(FormLinkType).asValueOrThrow(field.linkType)
    }
  }
}

class UserState {
  public user: User | null = null
  public hierarchy: Hierarchy | null = null
  public error: string | null = null
}

class UserGetters extends Getters<UserState> {
  get isLoggedIn() {
    return this.state.user !== null
  }

  public hierarchyElem(id: number): HierarchyElem | undefined {
    if (this.state.hierarchy) {
      return this.state.hierarchy.hierarchy.find(
        (elem: HierarchyElem) => elem.id === id
      )
    }
  }

  public getTable(schema: string, name: string): Table | undefined {
    if (!this.state.hierarchy) {
      return
    }
    return this.state.hierarchy.hierarchy.find((elem: HierarchyElem) => {
      if (instanceOfTable(elem)) {
        if (elem.schema === schema && elem.tableName === name) {
          return true
        }
      }
    }) as Table | undefined
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
    if (this.state.hierarchy) {
      for (const elem of this.state.hierarchy.hierarchy) {
        setEnums(elem)
      }
    }
  }

  public resolveAccess() {
    const roles = new Set(this.state.user!.roles)
    for (const elem of this.state.hierarchy!.hierarchy) {
      elem.userAccess = new Set()
      for (const access of elem.accessRights) {
        if (roles.has(access.role)) {
          for (const accessType of access.access) {
            elem.userAccess.add(accessType)
          }
        }
      }
    }
  }

  public reset() {
    const s: any = new UserState()
    Object.keys(s).forEach((key: any) => {
      ;(this.state as any)[key] = s[key]
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
      this.mutations.resolveAccess()
    } catch (err) {
      // console.error(err)
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
