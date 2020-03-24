import { DefaultResponse } from '@/types/user'
import { LogicResponse } from '@/types/logic'

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
  rowCount: number | null
  records: KeysMap<LoadedRecord>
}

export interface TableResponse extends LogicResponse {
  data: RowData
  total: number
}

export interface EntryResponse extends LogicResponse {
  [key: string]: any
}

export interface TableErrorResponse extends DefaultResponse {
  data: ValidationInfo | DefaultInfo | any
}

export interface ValidationInfo {
  [key: string]: string[]
}

export type DefaultInfo = string

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
  links: CreateLink[]
}

export enum CreateLinkType {
  fk,
  relationship
}

export interface CreateLink {
  id: number
  key: string | number
  rowName: string
  fkName?: string
  type: CreateLinkType
}

export type TableDelete = boolean

export enum ErrorSeverity {
  error,
  warning
}

export enum ErrorFixType {
  delete
}

export interface ErrorFix {
  type: ErrorFixType,
  args: any
}

export interface ValidationError {
  rowName: string
  message: string
  severity?: ErrorSeverity
  fixes?: ErrorFix[]
}

export interface TransactionErrors {
  [key: number]: KeysMap<ValidationError[]>
}
