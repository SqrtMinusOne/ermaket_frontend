import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
  Context,
} from 'vuex-smart-module'
import { Store } from 'vuex'
import { $enum } from 'ts-enum-util'
import {
  User,
  Hierarchy,
  HierarchyElem,
  Access,
  PrebuiltPage,
  PrebuiltPageType,
  TableLinkType,
  FormLinkType,
  FormDescription,
  Table,
  SortedTables,
} from '@/types/user'
import {
  instanceOfTable,
  instanceOfForm,
  instanceOfPrebuiltPage,
  instanceOfLinkedColumn,
  instanceOfLinkedField,
} from '@/types/user_guards'
import { logic } from './logic'
import UserAPI from '@/api/user'
import SchemaGenerator from '@/api/form'

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
  else if (instanceOfForm(elem)) {
    setEnumsForm(elem.formDescription)
  }
  else if (instanceOfPrebuiltPage(elem)) {
    setEnumsPrebuiltPage(elem)
  }
}

function setEnumsPrebuiltPage(elem: PrebuiltPage) {
  elem.type = $enum(PrebuiltPageType).asValueOrThrow(elem.type)
}

function setEnumsForm(elem: FormDescription) {
  for (const field of elem.fields) {
    if (instanceOfLinkedField(field)) {
      field.linkType = $enum(FormLinkType).asValueOrThrow(field.linkType)
    }
  }
}

function setTable(sorted: SortedTables, table: Table) {
  if (!(table.schema in sorted)) {
    sorted[table.schema] = {}
  }
  sorted[table.schema][table.tableName] = table
}

class UserState {
  public user: User | null = null
  public hierarchy: Hierarchy | null = null
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

  public get tables() {
    const tables: {[id: number]: Table}  = {}
    if (!this.state.hierarchy) {
      return tables
    }
    for (const elem of this.state.hierarchy.hierarchy) {
      if (instanceOfTable(elem)) {
        tables[elem.id] = elem
      }
    }
    return tables
  }

  public getTable(schema: string, name: string): Table | undefined {
    if (!this.state.hierarchy) {
      return
    }
    try {
      return this.state.hierarchy.tables[schema][name]
    } catch {
      return undefined
    }
  }
}

class UserMutations extends Mutations<UserState> {
  public setUser(newUser: User | null) {
    this.state.user = newUser
  }

  public setHierarchy(hierarchy: Hierarchy | null) {
    this.state.hierarchy = hierarchy
    if (this.state.hierarchy) {
      this.state.hierarchy.tables = {}
      const generator = new SchemaGenerator(hierarchy!)
      for (const elem of this.state.hierarchy.hierarchy) {
        setEnums(elem)

        if (instanceOfTable(elem)) {
          setTable(this.state.hierarchy.tables, elem)
          elem.formDescription.formSchema = generator.makeSchema(elem.formDescription)
        }
        if (instanceOfForm(elem)) {
          elem.formDescription.formSchema = generator.makeSchema(elem.formDescription)
        }
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
  private logic!: Context<typeof logic>

  public $init(store: Store<any>): void {
    this.logic = logic.context(store)
  }

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
      if (! await this.logic.actions.processLogic(response)) {
        return
      }
      await this.actions.fetchUser()
    } catch (err) {
      await this.logic.actions.processLogicError(err.response)
      return err
    }
  }

  public async logout() {
    try {
      const response = await UserAPI.logout()
      await this.logic.actions.processLogic(response)
    } catch (err) {
      await this.logic.actions.processLogicError(err.response)
    }
    finally {
      this.mutations.reset()
      this.logic.mutations.reset()
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
