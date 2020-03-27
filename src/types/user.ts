import { LogicResponse } from './logic'

export interface DefaultResponse extends LogicResponse {
  ok: boolean
  message?: string
  traceback?: string
  [key: string]: any
}

export interface User {
  login: string
  roles: string[]
}

export enum Access { // TODO Create?
  view = 'view',
  change = 'change',
  delete = 'delete',
}

export interface AccessRight {
  role: string
  access: Access[]
}

export enum Activation {
  open = 'open',
  afterOpen = 'afterOpen',
  read = 'read',
  transaction = 'transaction',
  login = 'login',
  logout = 'logout',
  call = 'call'
}

export interface Trigger {
  activation: Activation,
  scriptId: number
}

export enum ButtonLocation {
  top = 'top',
  cardHeader = 'cardHeader'
}

export interface Button {
  text: string
  location: ButtonLocation
  variant: string
  scriptId: number
}

export interface UserTrigger {
  [key: string]: Trigger[]
}

export interface HierarchyElem {
  id: number
  name: string
  overrideIcon?: string
  accessRights: AccessRight[]
  userAccess: Set<Access>
  buttonList?: Button[]
  triggerList?: Trigger[]
  userTrigger: UserTrigger
  _tag_name?: string
}

export interface Section extends HierarchyElem {
  children: number[]
}

export interface Column {
  rowName: string
  text: string
  type: string
  isSort: boolean
  isFilter: boolean
  isEditable: boolean
  isVisible: boolean
  isUnique: boolean
  isPk: boolean
  isRequired: boolean
  dateFormat?: string
  isAuto: boolean
  default: any
}

export enum TableLinkType {
  simple = 'simple',
  dropdown = 'dropdown',
  linked = 'linked',
  combined = 'combined'
}

export interface LinkedColumn extends Column {
  linkTableName: string
  linkSchema: string
  linkType: TableLinkType
  fkName?: string
  isMultiple: boolean
  linkMultiple: boolean
  linkRequired: boolean
  linkName: string
}

export enum FormLinkType {
  simple = 'simple',
  dropdown = 'dropdown',
  linkedTable = 'linkedTable',
  linkedForm = 'linkedForm',
  groupedForm = 'groupedForm'
}

export interface Field {
  rowName: string
  text: string
  isEditable: boolean
  isVisible: boolean
  hint: string | null,
  help: string | null
}

export interface LinkedField extends Field {
  linkType: FormLinkType
}

export interface FormGroup {
  legend: string
  rows: string[]
}

// TODO
export type GenField = any

export interface Group {
  legend: string
  fields: GenField[]
}

export interface FormSchema {
  fields?: GenField[]
  groups?: Group[]
}

export interface FormDescription {
  schema: string
  tableName: string
  fields: Array<Field|LinkedField>
  groups: FormGroup[]
  formSchema: FormSchema
}

export interface Table extends HierarchyElem {
  tableName: string
  schema: string
  linesOnPage: number
  columns: Column[]
  formDescription?: FormDescription
  hidden: boolean
}

export interface SortedTables {
  [key: string]: {
    [key: string]: Table
  }
}

export interface Form extends HierarchyElem {
  formDescription: FormDescription
}

export interface Page extends HierarchyElem {
  pageName: string
  addCard?: boolean
}

export enum PrebuiltPageType {
  sql = 'sql'
}

export interface PrebuiltPage extends HierarchyElem {
  type: PrebuiltPageType
}

export interface Hierarchy {
  hierarchy: Array<Section|Table|Form|Page|PrebuiltPage>
  tables: SortedTables
  root: number[]
}
