import {
  Transaction,
  KeysMap,
  TransactionUnit,
  LoadedTable,
  ErrorSeverity,
  TableDelete,
  TableUpdate,
  TableCreate,
  ValidationError,
  TransactionErrors,
} from '@/types/tables'
import { instanceOfLinkedColumn } from '@/types/user_guards'
import { instanceOfTableUpdate } from '@/types/table_guards'
import { Table, Column, LinkedColumn, SortedTables } from '@/types/user'
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

type LinkedCheck = Array<{
  column: LinkedColumn
  table: Table
  counterpart: LinkedColumn
}>

interface LoadedSlice {
  [key: number]: LoadedEntry
}

export default class Validator {
  /**
   * Run complete validation for the whole transaction
   *
   * @static
   * @param {Transaction} transaction
   * @param {LoadedSlice} loaded
   * @returns {TransactionErrors}
   */
  public static validateTransaction(
    transaction: Transaction,
    loaded: LoadedSlice,
    tables: SortedTables
  ): TransactionErrors {
    const errors: TransactionErrors = {}
    for (const t of Object.entries(transaction)) {
      const [ids, unit]: [string, TransactionUnit] = t
      const id = Number(ids)
      errors[id] = this.check_changes(transaction, id, loaded[id], tables)
      errors[id] = {
        ...errors[id],
        ...this.check_deletes(transaction, id, loaded),
      }
    }
    return _.omitBy(errors, (value) => _.isEmpty(value))
  }

  /**
   * Run non resource-consuming validation for a single change
   *
   * @static
   * @param {TableUpdate | TableCreate} data
   * @param {Table} table
   * @param {Transaction} transaction
   * @returns {ValidationError[]}
   */
  public static validateChange(
    data: TableUpdate | TableCreate,
    table: Table,
    transaction: Transaction,
    tables: SortedTables
  ): ValidationError[] {
    const errors: ValidationError[] = []
    const requiredChecks = table.columns.filter(
      (column) => column.isRequired && !column.isAuto
    )
    const linkedChecks = this.get_linked_checks(table, tables)
    const keyField = table.columns.find((column) => column.isPk)!.rowName
    errors.push(...this.check_required(requiredChecks, data))
    if (instanceOfTableUpdate(data)) {
      errors.push(
        ...this.check_linked(
          linkedChecks,
          transaction,
          table.id,
          data,
          keyField
        )
      )
    }
    return errors
  }

  /**
   * Run non resource-consuming validation for a single delete
   *
   * @static
   * @param {TableDelete} data
   * @param {Table} table
   * @returns {ValidationError[]}
   */
  public static validateDelete(
    data: TableDelete,
    table: Table
  ): ValidationError[] {
    if (data) {
      return this.get_cascade_errors(table)
    }
    return []
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
    transaction: Transaction,
    id: number,
    data: LoadedEntry,
    tables: SortedTables
  ): KeysMap<ValidationError[]> {
    const unit = transaction[id]
    const errors: KeysMap<ValidationError[]> = {}
    const { repeatSets, uniqueChecks } = this.get_duplicates(unit, data)
    const requiredChecks = data.table.columns.filter(
      (column) => column.isRequired && !column.isAuto
    )
    const linkedChecks = this.get_linked_checks(data.table, tables)
    const keyField = data.loaded.keyField

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
      if (instanceOfTableUpdate(change)) {
        for (const err of this.check_linked(
          linkedChecks,
          transaction,
          id,
          change,
          keyField,
          true
        )) {
          pushError(errors, key, err)
        }
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
          if (!isNil(upd[column.rowName]) && _.isEmpty(upd[column.rowName])) {
            errors.push({
              rowName: column.rowName,
              message: `"${column.text}" cannot be empty`,
              severity: ErrorSeverity.error,
            })
          }
        } else if (isNil(upd[column.fkName])) {
          errors.push({
            rowName: column.rowName,
            message: `"${column.text}" is a required field`,
            severity: ErrorSeverity.error,
          })
        }
      } else if (isNil(upd[column.rowName])) {
        errors.push({
          rowName: column.rowName,
          message: `"${column.text}" is a required field`,
          severity: ErrorSeverity.error,
        })
      }
    }
    return errors
  }

  private static get_linked_checks(
    table: Table,
    tables: SortedTables
  ): LinkedCheck {
    return (table.columns.filter(
      (column) =>
        instanceOfLinkedColumn(column) &&
        column.linkRequired &&
        column.isMultiple
    ) as LinkedColumn[]).map((column) => ({
      column,
      table: tables[column.linkSchema][column.linkTableName],
      counterpart: tables[column.linkSchema][column.linkTableName].columns.find(
        (col) => instanceOfLinkedColumn(col) && col.linkName === column.linkName
      )! as LinkedColumn,
    }))
  }

  private static check_linked(
    linkedChecks: LinkedCheck,
    transaction: Transaction,
    id: number,
    data: TableUpdate,
    keyField: string,
    extensive: boolean = false
  ) {
    const errors: ValidationError[] = []

    for (const check of linkedChecks) {
      const { column, counterpart, table } = check
      if (!_.isNil(data.oldData[column.rowName]) && !_.isNil(data.newData[column.rowName])) {
        const oldLinks = data.oldData[column.rowName]
        const newLinks = data.newData[column.rowName]
        const removedLinks = _.difference(oldLinks, newLinks)

        for (const key of removedLinks) {
          if (this.is_to_delete(transaction, table.id, key)) {
            // everything is 100% fine, linked record is deleted
            continue
          }
          if (
            extensive &&
            this.is_linked_to_another(transaction, column, id, key)
          ) {
            // The record was linked to another record from the same table
            continue
          }
          if (
            this.is_relinked_to_another(
              transaction,
              column,
              counterpart,
              data,
              table.id,
              key,
              keyField
            )
          ) {
            // The record was relinked
            continue
          }
          if (extensive) {
            errors.push({
              rowName: column.rowName,
              severity: ErrorSeverity.error,
              message: `A record from "<b>${table.name}</b>" with key "<b>${key}</b>" will become linked to nothing`
            })
          } else {
            errors.push({
              rowName: column.rowName,
              severity: ErrorSeverity.warning,
              message: `A record from "<b>${table.name}</b>" with key "<b>${key}</b>" may become linked to nothing`
            })
          }
        }
      }
    }
    return errors
  }

  private static is_to_delete(
    transaction: Transaction,
    tableId: number,
    key: any
  ) {
    return transaction[tableId] && transaction[tableId].delete[key]
  }

  private static is_linked_to_another(
    transaction: Transaction,
    column: LinkedColumn,
    id: number,
    key: any
  ) {
    return [
      ...Object.values(transaction[id].create),
      ...Object.values(transaction[id].update),
    ].some((datum) => datum.newData[column.rowName] && (datum.newData[column.rowName] as any[]).includes(key))
  }

  private static is_relinked_to_another(
    transaction: Transaction,
    column: LinkedColumn,
    counterpart: LinkedColumn,
    data: TableUpdate,
    tableId: number,
    key: any,
    keyField: string
  ) {
    return (
      transaction[tableId] &&
      transaction[tableId].update[key] &&
      transaction[tableId].update[key].newData[counterpart.fkName!] !==
        data.newData[keyField]
    )
  }

  private static check_deletes(
    transaction: Transaction,
    id: number,
    slice: LoadedSlice
  ): KeysMap<ValidationError[]> {
    const errors: KeysMap<ValidationError[]> = {}
    const deletes = transaction[id].delete

    for (const key of Object.keys(deletes)) {
      for (const error of this.get_cascade_errors(slice[id].table)) {
        pushError(errors, key, error)
      }
    }
    return errors
  }

  private static get_cascade_errors(table: Table) {
    const cascades = table.columns.filter(
      (column) =>
        instanceOfLinkedColumn(column) &&
        column.linkRequired &&
        !column.linkMultiple
    ) as LinkedColumn[]
    const errors: ValidationError[] = []
    for (const cascade of cascades) {
      errors.push({
        rowName: cascade.rowName,
        message: `Linked records in the column <b>"${cascade.text}"</b> will be <b>deleted</b> with this record`,
        severity: ErrorSeverity.warning,
      })
    }
    return errors
  }
}
