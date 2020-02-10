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
  KeysMap,
} from '@/types/tables'
import { instanceOfTable } from '@/types/user_guards'
import { Table, Column } from '@/types/user'
import TableAPI from '@/api/table'
import { user } from './user'
import moment from 'moment'
import _ from 'lodash'

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

function mapKey(key: any, mapKeys: KeysMap<any>) {
  if (mapKeys[key] !== undefined) {
    return mapKeys[key]
  }
  return key
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
    if (this.state.loaded[id].data.length >= rowEnd) {
      const slice = this.state.loaded[id].data.slice(rowStart, rowEnd)
      if (slice.every((datum) => datum !== undefined && datum !== null)) {
        return slice
      }
    }
    return null
  }

  public isLoaded(id: number) {
    return this.state.loaded[id] !== undefined
  }

  public getRecord(id: number, key: any) {
    if (!this.state.loaded[id]) {
      return null
    }
    const record = this.state.loaded[id].records[key]
    return record || null
  }

  public isTransactee(id: number, key: any) {
    return (
      this.state.transaction[id] &&
      (this.state.transaction[id].update[key] ||
        this.state.transaction[id].create[key] ||
        this.state.transaction[id].delete[key])
    )
  }

  public isToDelete(id: number, key: any) {
    return (
      this.state.transaction[id] &&
      this.state.transaction[id].delete[key] !== undefined
    )
  }

  public isToUpdate(id: number, key: any) {
    return (
      this.state.transaction[id] &&
      this.state.transaction[id].update[key] !== undefined
    )
  }
}

class TableMutations extends Mutations<TableState> {
  public initLoaded({ id, keyField }: { id: number; keyField: string }) {
    this.state.loaded[id] = {
      data: [],
      rowCount: 0,
      keyField,
      time: new Date(),
      records: {},
    }
  }

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
    this.state.loaded[id].time = new Date()
    rowStart = rowStart > 0 ? rowStart : 0
    data.forEach((datum, index) => {
      this.state.loaded[id].data[index + rowStart] = datum
    })
    this.state.loaded[id].rowCount = rowCount
  }

  public setRecord({ id, key, data }: { id: number; key: any; data: any }) {
    this.state.loaded[id].records[key] = {
      data,
      time: new Date(),
    }
  }

  public updateRecord({ id, key, data }: { id: number; key: any; data: any }) {
    this.state.loaded[id].records[key].data = {
      ...this.state.loaded[id].records[key].data,
      ...data,
    }
  }

  public updateRow({
    id,
    index,
    data,
    scoped = false,
  }: {
    id: number
    index: number
    data: any
    scoped?: boolean
  }) {
    if (!scoped) {
      this.state.loaded[id].data[index] = {
        ...this.state.loaded[id].data[index],
        ...data,
      }
    } else {
      for (const key of Object.keys(this.state.loaded[id].data[index])) {
        this.state.loaded[id].data[index][key] = data[key]
      }
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
      casts.forEach((cast) => row && cast(row))
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

  public initTransaction(id: number) {
    if (!this.state.transaction[id]) {
      this.state.transaction[id] = {
        update: {},
        create: {},
        delete: {},
        mapKeys: {},
      }
    }
  }

  public setUpdate({
    id,
    oldData,
    newData,
  }: {
    id: number
    oldData: any
    newData: any
  }) {
    const key = newData[this.state.loaded[id].keyField]
    const oldKey = oldData ? oldData[this.state.loaded[id].keyField] : null
    if (key === undefined) {
      throw new Error('newData must have a key')
    }
    if (
      oldKey !== null &&
      oldKey !== key
    ) {
      if(this.state.transaction[id].update[oldKey]) {
        this.state.transaction[id].update[key] = this.state.transaction[
          id
        ].update[oldKey]
        this.state.transaction[id].mapKeys[oldKey] = key
        delete this.state.transaction[id].update[oldKey]
      } else {
        this.state.transaction[id].mapKeys[oldKey] = key
      }
    }
    newData = _.pickBy(newData, (v, k) => !k.startsWith('_'))

    if (!this.state.transaction[id].update[key]) {
      this.state.transaction[id].update[key] = { oldData, newData }
    } else {
      this.state.transaction[id].update[key].newData = {
        ...this.state.transaction[id].update[key].newData,
        ...newData,
      }
    }
  }

  public applyUpdateToRecord({
    id,
    key,
    applyOld = true,
  }: {
    id: number
    key: any
    applyOld?: boolean
  }) {
    if (!this.state.transaction[id]) {
      return
    }
    const newKey = this.state.transaction[id].mapKeys[key]
    if (newKey !== undefined) {
      this.state.loaded[id].records[newKey] = this.state.loaded[id].records[key]
      delete this.state.transaction[id].mapKeys[key]
      key = newKey
    }

    if (!this.state.loaded[id].records[key]) {
      return
    }

    if (this.state.transaction[id].update[key]) {
      if (applyOld) {
        this.state.transaction[id].update[key].oldData = {
          ...this.state.transaction[id].update[key].oldData,
          ...this.state.loaded[id].records[key].data,
        }
      }

      this.state.loaded[id].records[key].data = {
        ...this.state.loaded[id].records[key].data,
        ...this.state.transaction[id].update[key].newData,
      }
    }
  }

  public applyUpdatesToTable({
    id,
    startRow,
    endRow,
  }: {
    id: number
    startRow: number
    endRow: number
  }) {
    if (!this.state.transaction[id]) {
      return
    }
    const loaded = this.state.loaded[id]
    for (let i = startRow; i < endRow; i++) {
      if (loaded.data[i]) {
        let key = loaded.data[i][loaded.keyField]
        key = mapKey(key, this.state.transaction[id].mapKeys)
        if (this.state.transaction[id].update[key]) {
          loaded.data[i] = {
            ...loaded.data[i],
            ..._.pick(
              this.state.transaction[id].update[key].newData,
              Object.keys(loaded.data[i])
            ),
          }
        }
      }
    }
  }

  public applyOneUpdateToTable({
    id,
    key,
    index,
  }: {
    id: number
    key: any
    index?: number
  }) {
    if (!this.state.transaction[id]) {
      return
    }
    if (key === undefined && index === undefined) {
      throw new Error('Key and index cannot be both undefined')
    }
    index =
      index !== undefined
        ? index
        : this.state.loaded[id].data.find(
            (datum) => datum[this.state.loaded[id].keyField] === key
          )
    if (index === undefined) {
      return
    }
    key = mapKey(key, this.state.transaction[id].mapKeys)
    if (
      !this.state.transaction[id] ||
      !this.state.transaction[id].update[key]
    ) {
      return
    }
    this.state.loaded[id].data[index] = {
      ...this.state.loaded[id].data[index],
      ..._.pick(
        this.state.transaction[id].update[key],
        Object.keys(this.state.loaded[id].data[index])
      ),
    }
  }

  public setDelete({ id, key }: { id: number; key: any }) {
    this.state.transaction[id].delete[key] = true
  }

  public revertChanges({
    id,
    index,
    key,
  }: {
    id: number
    index: number
    key: any
  }) {
    if (this.state.transaction[id].delete[key]) {
      delete this.state.transaction[id].delete[key]
    }
    if (this.state.transaction[id].create[key]) {
      delete this.state.transaction[id].create[key]
    }
    if (!this.state.transaction[id].update[key]) {
      return
    }

    const update = this.state.transaction[id].update[key]
    delete this.state.transaction[id].update[key]
    const oldKey = _.findKey(
      this.state.transaction[id].mapKeys,
      (k) => k === key
    )

    if (this.state.loaded[id].records[key]) {
      delete this.state.loaded[id].records[key].data
      key = oldKey === undefined ? key : oldKey
      this.state.loaded[id].records[key].data = update.oldData
    }

    if (this.state.loaded[id].data[index]) {
      this.state.loaded[id].data[index] = _.pick(
        update.oldData,
        Object.keys(this.state.loaded[id].data[index])
      )
    }
  }

  public tryToCloseTransaction(id: number) {
    if (this.state.transaction[id]) {
      const t = this.state.transaction[id]
      if (
        Object.keys(t.update).length === 0 &&
        Object.keys(t.delete).length === 0 &&
        Object.keys(t.create).length === 0
      ) {
        delete this.state.transaction[id]
      }
    }
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

  public checkLoaded(elem: Table) {
    if (!this.getters.isLoaded(elem.id)) {
      this.mutations.initLoaded({
        id: elem.id,
        keyField: elem.columns.find((column) => column.isPk)!.rowName,
      })
    }
  }

  public setRows({
    elem,
    rowStart,
    data,
    rowCount,
  }: {
    elem: Table
    rowStart: number
    data: any[]
    rowCount: number
  }) {
    this.actions.checkLoaded(elem)
    this.mutations.setRows({
      id: elem.id,
      rowStart,
      rowCount,
      data,
    })
    this.mutations.makeCasts({ id: elem.id, columns: elem.columns })
    this.mutations.applyUpdatesToTable({
      id: elem.id,
      startRow: rowStart,
      endRow: rowStart + data.length,
    })
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
    this.actions.checkLoaded(elem)
    if (!filter && !order) {
      this.actions.setRows({
        elem,
        rowStart,
        rowCount: data.data.total,
        data: data.data.data,
      })
      return this.getters.getRows(id, rowStart, rowEnd)
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
    this.actions.checkLoaded(elem)
    this.mutations.setRecord({ id, key, data: data.data })
    this.mutations.applyUpdateToRecord({ id, key })
    return this.getters.getRecord(id, key)
  }

  public setRowUpdate({
    id,
    index,
    oldData,
    data,
  }: {
    id: number
    index?: number
    oldData?: any
    data: any
  }) {
    if (index === undefined && oldData === undefined) {
      throw new Error('index and oldData can\'t both be undefined')
    }
    oldData = oldData ? oldData : this.state.loaded[id].data[index!]
    const keyField = this.state.loaded[id].keyField
    data[keyField] =
      data[keyField] !== undefined ? data[keyField] : oldData[keyField]
    this.mutations.initTransaction(id)
    this.mutations.setUpdate({ id, oldData, newData: data })
    if (index !== undefined) {
      this.mutations.updateRow({ id, index, data })
    }
    this.mutations.applyUpdateToRecord({
      id,
      key: data[keyField],
      applyOld: false,
    })
  }

  public setRecordUpdate({
    id,
    key,
    data,
    index,
  }: {
    id: number
    key: any
    data: any
    index?: number
  }) {
    const oldData = this.state.loaded[id].records[key].data
    this.mutations.initTransaction(id)
    this.mutations.setUpdate({ id, oldData, newData: data })
    this.mutations.updateRecord({ id, key, data })
    this.mutations.applyOneUpdateToTable({ id, key, index })
  }

  public setDelete({ id, key }: { id: number; key: any }) {
    this.mutations.initTransaction(id)
    this.mutations.setDelete({ id, key })
  }

  public revert({ id, index, key }: { id: number; key: any; index?: number }): { row: any, record: any } {
    if (index === undefined && this.getters.isToUpdate(id, key)) {
      index = this.state.loaded[id].data.findIndex(
        (datum) => datum[this.state.loaded[id].keyField] === key
      )
    }
    this.mutations.revertChanges({ id, index, key } as {
      id: number
      index: number
      key: any
    })
    this.mutations.tryToCloseTransaction(id)
    return {
      row: index !== undefined ? this.state.loaded[id].data[index] : null,
      record: this.state.loaded[id].records[key]
    }
  }
}

export const table = new Module({
  state: TableState,
  getters: TableGetters,
  mutations: TableMutations,
  actions: TableActions,
})

export const tableMapper = createMapper(table)
