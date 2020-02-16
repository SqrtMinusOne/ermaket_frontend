import {
  Transaction,
  KeysMap,
  TransactionUnit,
  LoadedTable,
} from '@/types/tables'
import { instanceOfLinkedColumn } from '@/types/user_guards'
import { Table, Column, LinkedColumn } from '@/types/user'
import _ from 'lodash'

export interface TransactionErrors {
  [key: number]: KeysMap<ValidationError[]>
}

function pushError(
  errors: KeysMap<ValidationError[]>,
  key: any,
  error: ValidationError
) {
  if (errors[key]) {
    errors[key].push(error)
  } else {
    errors[key] = [error]
  }
}

function getTable(
  slice: LoadedSlice,
  schema: string,
  name: string
): LoadedEntry | undefined {
  return Object.values(slice).find(
    (entry: LoadedEntry) =>
      entry.table.schema === schema && entry.table.tableName === name
  )
}

function getLoaded(
  loaded: LoadedEntry,
  key: any
) {
  return {
    ...loaded.loaded.data.find((datum) => datum[loaded.loaded.keyField] === key),
    ...loaded.loaded.records[key]
  }
}

export interface ValidationError {
  rowName: string
  message: string
}

interface LoadedEntry {
  table: Table
  loaded: LoadedTable
}

interface LoadedSlice {
  [key: number]: LoadedEntry
}

export default class Validator {
  public static validateTransaction(
    transaction: Transaction,
    loaded: LoadedSlice
  ): TransactionErrors {
    const errors: TransactionErrors = {}
    for (const t of Object.entries(transaction)) {
      const [ids, unit]: [string, TransactionUnit] = t
      const id = Number(ids)
      errors[id] = this.check_changes(unit, loaded[id])
      errors[id] = {...errors[id], ...this.check_deletes(transaction, id, loaded)}
    }
    return errors
  }

  private static get_duplicates(unit: TransactionUnit, data: LoadedEntry) {
    const uniqueSets: { [key: string]: Set<any> } = {}
    const repeatSets: { [key: string]: Set<any> } = {}
    const uniqueChecks = data.table.columns
      .filter((column) => column.isUnique)
      .map((column) => {
        uniqueSets[column.rowName] = new Set()
        return column
      })
    const keyField = data.loaded.keyField

    for (const datum of data.loaded.data) {
      if (unit.delete[datum[keyField]]) {
        continue
      }
      for (const column of uniqueChecks) {
        if (uniqueSets[column.rowName].has(datum[column.rowName])) {
          repeatSets[column.rowName].add(datum[column.rowName])
        } else {
          uniqueSets[column.rowName].add(datum[column.rowName])
        }
      }
    }
    return { uniqueChecks, repeatSets }
  }

  private static check_changes(
    unit: TransactionUnit,
    data: LoadedEntry
  ): KeysMap<ValidationError[]> {
    const errors: KeysMap<ValidationError[]> = {}
    const { repeatSets, uniqueChecks } = this.get_duplicates(unit, data)
    const requiredChecks = data.table.columns.filter(
      (column) => column.isRequired && !column.isAuto
    )

    for (const [key, change] of [
      ...Object.entries(unit.create),
      ...Object.entries(unit.update),
    ]) {
      for (const column of uniqueChecks) {
        if (repeatSets[column.rowName].has(change.newData[column.rowName])) {
          pushError(errors, key, {
            rowName: column.rowName,
            message: `"${column.text}" cannot repeat`,
          })
        }
      }

      for (const column of requiredChecks) {
        if (instanceOfLinkedColumn(column)) {
          if (!column.fkName) {
            if (
              !_.isNil(change.newData[column.rowName]) &&
              _.isEmpty(change.newData[column.rowName])
            ) {
              pushError(errors, key, {
                rowName: column.rowName,
                message: `"${column.text}" cannot be empty`,
              })
            }
          } else if (_.isNil(change.newData[column.fkName])) {
            pushError(errors, key, {
              rowName: column.rowName,
              message: `"${column.text}" is a required field`,
            })
          }
        } else if (_.isNil(change.newData[column.rowName])) {
          pushError(errors, key, {
            rowName: column.rowName,
            message: `"${column.text}" is a required field`,
          })
        }
      }
    }
    return errors
  }
  
  private static check_deletes(
    transaction: Transaction,
    id: number,
    slice: LoadedSlice
  ): KeysMap<ValidationError[]> {
    const errors: KeysMap<ValidationError[]> = {}
    const assertions = this.get_delete_assertions(id, slice)

    if (_.isEmpty(assertions)) {
      return errors
    }

    for (const key of Object.keys(transaction[id].delete)) {
      const data = getLoaded(slice[id], key)
      for (const [rowName, assertion] of Object.entries(assertions)) {
        const fkValue = data[assertion.fk.fkName as any]
        if (!assertion.column.isMultiple) {
          if (!transaction[assertion.table.id].delete[fkValue]) {
            pushError(errors, key, {
              rowName,
              message: `This entry cannot be deleted because an entry from ${assertion.table.name} depends on it. Delete the linked entry as well.`
            })
          }
        } else {
          // TODO
        }
      }
    }
    
    return errors
  }

  private static get_delete_assertions(
    id: number,
    slice: LoadedSlice
  ) {
    const fks = slice[id].table.columns.filter(
      (column) => instanceOfLinkedColumn(column) && column.fkName
    ) as LinkedColumn[]
    
    const assertions: {[key: string]: {fk: LinkedColumn, table: Table, column: LinkedColumn}} = {}
    for (const fk of fks) {
      const loaded = getTable(slice, fk.linkSchema, fk.linkTableName)
      if (!loaded) {
        continue
      }
      const linkHere = loaded.table.columns.find(
        (column) =>
          instanceOfLinkedColumn(column) &&
          column.linkSchema === slice[id].table.schema &&
          column.linkTableName === slice[id].table.tableName &&
          column.isRequired
      ) as LinkedColumn
      if (!linkHere) {
        continue
      }
      assertions[fk.rowName] = { table: loaded.table, column: linkHere, fk }
    }
    return assertions
  }
}
