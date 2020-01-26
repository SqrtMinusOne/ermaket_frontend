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

export interface LoadedTable {
  data: RowData
  time: Date
  rowCount: number
}

export interface TableResponse {
  data: RowData
  total: number
}

export interface Loaded {
  [key: number]: LoadedTable
}

export interface Transaction {
  [key: string]: object[] // TODO
}
