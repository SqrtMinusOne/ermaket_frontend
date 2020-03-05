import {
  Transaction,
  KeysMap,
  TransactionUnit,
  LoadedTable,
  ErrorSeverity,
  TableUpdate,
  TableCreate,
  ValidationError,
  TransactionErrors,
} from '@/types/tables'
import { instanceOfLinkedColumn } from '@/types/user_guards'
import { Table, Column, LinkedColumn } from '@/types/user'
import _ from 'lodash'

function pushError(
  errors: KeysMap<ValidationError[]>,
  key: any,
  error: ValidationError
) {
  if (_.isNil(error.severity)) {
    error.severity = ErrorSeverity.error
  }
  if (errors[key]) {
    errors[key].push(error)
  } else {
    errors[key] = [error]
  }
}

function instanceOfTableUpdate(
  obj?: TableCreate | TableUpdate
): obj is TableUpdate {
  return obj ? 'oldData' in obj : false
}

function isNil(data: any) {
  return _.isNil(data) || data === ''
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

function getLoaded(loaded: LoadedEntry, key: any) {
  return {
    ...loaded.loaded.data.find(
      (datum) => datum[loaded.loaded.keyField] === key
    ),
    ...loaded.loaded.records[key],
  }
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
      errors[id] = {
        ...errors[id],
        ...this.check_deletes(transaction, id, loaded),
      }
    }
    return _.omitBy(errors, (value) => _.isEmpty(value))
  }

  public static validateChange(
    data: TableUpdate | TableCreate,
    table: Table
  ): ValidationError[] {
    const errors: ValidationError[] = []
    const requiredChecks = table.columns.filter(
      (column) => column.isRequired && !column.isAuto
    )
    errors.push(...this.check_required(requiredChecks, data))
    return errors
  }

  private static get_duplicates(unit: TransactionUnit, data: LoadedEntry) {
    const uniqueSets: { [key: string]: Set<any> } = {}
    const repeatSets: { [key: string]: Set<any> } = {}
    const uniqueChecks = data.table.columns
      .filter((column) => column.isUnique)
      .map((column) => {
        uniqueSets[column.rowName] = new Set()
        repeatSets[column.rowName] = new Set()
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
      for (const err of this.check_required(requiredChecks, change)) {
        pushError(errors, key, err)
      }
    }
    return errors
  }

  private static check_required(
    requiredChecks: Column[],
    change: TableCreate | TableUpdate
  ) {
    const upd = instanceOfTableUpdate(change)
      ? { ...change.oldData, ...change.newData }
      : change.newData
    const errors: ValidationError[] = []
    for (const column of requiredChecks) {
      if (instanceOfLinkedColumn(column)) {
        if (!column.fkName) {
          if (
            !isNil(upd[column.rowName]) &&
            _.isEmpty(upd[column.rowName])
          ) {
            errors.push({
              rowName: column.rowName,
              message: `"${column.text}" cannot be empty`,
              severity: ErrorSeverity.error
            })
          }
        } else if (isNil(upd[column.fkName])) {
          errors.push({
            rowName: column.rowName,
            message: `"${column.text}" is a required field`,
              severity: ErrorSeverity.error
          })
        }
      } else if (isNil(upd[column.rowName])) {
        errors.push({
          rowName: column.rowName,
          message: `"${column.text}" is a required field`,
          severity: ErrorSeverity.error
        })
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
    const deletes = transaction[id].delete

    const cascades = slice[id].table.columns.filter(
      (column) => instanceOfLinkedColumn(column) && column.linkRequired && !column.linkMultiple
    ) as LinkedColumn[]

    for (const key of Object.keys(deletes)) {
      for (const cascade of cascades) {
        pushError(errors, key, {
          rowName: cascade.rowName,
          message: `Linked records from the table <b>"${cascade.linkTableName}"</b> may be <b>deleted</b> as well`,
          severity: ErrorSeverity.warning
        })
      }
    }

    return errors
  }
}
