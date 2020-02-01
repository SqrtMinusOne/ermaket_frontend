import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
  Context,
} from 'vuex-smart-module'
import { Store } from 'vuex'

import {
  Loaded,
  Transaction,
  RowData,
  Filter,
  Order,
  Operator,
  Criterion,
} from '@/types/tables'
import { instanceOfTable } from '@/types/user_guards'
import { Table, Column } from '@/types/user'
import TableAPI from '@/api/table'
import { user } from './user'
import moment from 'moment'

/* tslint:disable:max-classes-per-file */

function makeFilter(t: Table, key: any): Criterion[] {
  const pk = t.columns.find((column) => column.isPk) as Column
  return [
    {
      field_name: pk.rowName,
      operator: Operator.equals,
      field_value: key,
    },
  ]
}

function makeKey(t: Table, filter: Filter) {
  const criteria = Array.isArray(filter) ? filter : (filter.and as Criterion[])
  const pk = t.columns.find((column) => column.isPk) as Column
  const criterion = criteria.find(
    (c) => c.field_name === pk.rowName
  ) as Criterion
  return criterion.field_value
}

class TableState {
  public loaded: Loaded = {}
  public transaction: Transaction = {}
}

class TableGetters extends Getters<TableState> {
  public getRows(id: number, rowStart: number, rowEnd: number): RowData | null {
    if (!this.state.loaded[id]) {
      return null
    }
    rowStart = rowStart > 0 ? rowStart : 0
    rowEnd = rowEnd > 0 ? rowEnd : this.state.loaded[id].data.length - 1
    if (this.state.loaded[id].data.length > rowEnd) {
      const slice = this.state.loaded[id].data.slice(rowStart, rowEnd)
      if (slice.every((datum) => datum !== undefined && datum !== null)) {
        return slice
      }
    }
    return null
  }

  public getRecord(id: number, key: any) {
    if (!this.state.loaded[id]) {
      return null
    }
    const record = this.state.loaded[id].records[key]
    return record || null
  }
}

class TableMutations extends Mutations<TableState> {
  public setRows({
    id,
    rowStart,
    rowCount,
    data,
  }: {
    id: number
    rowStart: number
    rowCount: number
    data: RowData
  }) {
    if (!this.state.loaded[id]) {
      this.state.loaded[id] = {
        data: [],
        rowCount,
        time: new Date(),
        records: {},
      }
    } else {
      this.state.loaded[id].time = new Date()
    }
    rowStart = rowStart > 0 ? rowStart : 0
    data.forEach((datum, index) => {
      this.state.loaded[id].data[index + rowStart] = datum
    })
  }

  public setRecord({ id, key, data }: { id: number; key: any; data: any }) {
    if (!this.state.loaded[id]) {
      this.state.loaded[id] = {
        data: [],
        rowCount: 0,
        time: new Date(),
        records: {},
      }
    }

    this.state.loaded[id].records[key] = {
      data,
      time: new Date(),
    }
  }

  public updateRecord({ id, key, data }: { id: number, key: any, data: any }) {
    this.state.loaded[id].records[key].data = {
      ...this.state.loaded[id].records[key].data, ...data
    }
  }

  public updateRow({ id, index, data }: { id: number, index: number, data: any }) {
    this.state.loaded[id].data[index] = {
      ...this.state.loaded[id].data[index], ...data
    }
  }

  public makeCasts({ id, columns }: { id: number; columns: Column[] }) {
    const casts: Array<(col: any[]) => void> = []
    columns.forEach((column, index) => {
      if (column.type === 'timestamp' || column.type === 'date') {
        casts.push((col: any) => {
          col[column.rowName] = moment(col[column.rowName])
        })
      }
    })

    for (const row of this.state.loaded[id].data) {
      casts.forEach((cast) => cast(row))
    }
  }

  public clearRows(id: number) {
    delete this.state.loaded[id]
  }

  public reset() {
    const s: any = new TableState()
    Object.keys(s).forEach((key: any) => {
      ;(this.state as any)[key] = s[key]
    })
  }
}

class TableActions extends Actions<
  TableState,
  TableGetters,
  TableMutations,
  TableActions
> {
  private user!: Context<typeof user>

  public $init(store: Store<any>): void {
    this.user = user.context(store)
  }

  public async fetchRows({
    id,
    rowStart,
    rowEnd,
    filter,
    order,
    reload,
  }: {
    id: number
    rowStart: number
    rowEnd: number
    filter?: Filter
    order?: Order
    reload?: boolean
  }) {
    const elem = this.user.getters.hierarchyElem(id)
    if (!instanceOfTable(elem)) {
      return
    }
    if (!reload && !filter && !order) {
      const rows = this.getters.getRows(id, rowStart, rowEnd)
      if (rows) {
        return rows
      }
    }
    const data = await TableAPI.get_table(
      elem.tableName,
      elem.schema,
      filter,
      rowStart,
      rowEnd > 0 ? rowEnd - rowStart : -1,
      order
    )
    if (!filter && !order) {
      this.mutations.setRows({
        id,
        rowStart,
        rowCount: data.data.total,
        data: data.data.data,
      })
      this.mutations.makeCasts({ id, columns: elem.columns })
    }
    return data.data.data
  }

  public async fetchRecord({
    id,
    filter,
    key,
    reload,
  }: {
    id: number
    filter?: Filter
    key?: any
    reload?: boolean
  }) {
    const elem = this.user.getters.hierarchyElem(id)
    if (!instanceOfTable(elem)) {
      return
    }
    if (!filter && !key) {
      throw new TypeError('filter and key can\'t both be undefined')
    }
    key = key !== undefined ? key : makeKey(elem, filter as Filter)
    const record = this.getters.getRecord(id, key)
    if (record && !reload) {
      return record
    }
    if (!filter) {
      filter = makeFilter(elem, key)
    }
    const data = await TableAPI.get_entry(elem.tableName, elem.schema, filter)
    this.mutations.setRecord({ id, key, data: data.data })
    return this.getters.getRecord(id, key)
  }

  public setRecordUpdate({ id, key, data }: { id: number, key: any, data: any }) {
    this.mutations.updateRecord({ id, key, data })
  }

  public setRowUpdate({ id, index, data }: { id: number, index: number, data: any }) {
    this.mutations.updateRow({ id, index, data })
  }
}

export const table = new Module({
  state: TableState,
  getters: TableGetters,
  mutations: TableMutations,
  actions: TableActions,
})

export const tableMapper = createMapper(table)
