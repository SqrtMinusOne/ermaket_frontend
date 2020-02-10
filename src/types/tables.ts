export interface Criterion {
  field_name: string
  operator: Operator | string
  field_value: string
}

export enum Operator {
  equals,
  not_equals,
  less_than,
  less_than_equals,
  greater_than,
  greater_than_equals,
  like,
  ilike,
  startswith,
  istartswith,
  endswith,
  iendswith,
  contains,
  icontains,
  match,
  in,
  notin,
  isnull,
  isnotnull,
  any,
  has,
}

export interface FilterObject {
  and?: Criterion[]
  or?: Criterion[]
}

export type Filter = FilterObject | Criterion[]

export type Order = string[]

export type RowData = any[]

export interface LoadedRecord {
  data: any
  time: Date
}

export interface KeysMap<Type> {
  [key: string]: Type
  [key: number]: Type
}

export interface LoadedTable {
  data: RowData
  time: Date
  keyField: string
  rowCount: number
  records: KeysMap<LoadedRecord>
}

export interface TableResponse {
  data: RowData
  total: number
}

export interface Loaded {
  [id: number]: LoadedTable
}

export interface Transaction {
  [id: number]: TransactionUnit
}

export enum TransactionType {
  update,
  create,
  delete
}

export interface TransactionUnit {
  update: KeysMap<TableUpdate>
  create: KeysMap<TableCreate>
  delete: KeysMap<TableDelete>
  mapKeys: KeysMap<any>
}

export interface TableUpdate {
  newData: any
  oldData: any
}

export interface TableCreate {
  newData: any
}

export type TableDelete = boolean
