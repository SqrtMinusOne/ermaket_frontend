export interface DefaultResponse {
  ok: boolean
  message?: string
  [key: string]: any
}

export interface User {
  login: string
  roles: string[]
}

export enum Access {
  view,
  change,
  delete,
}

export interface AccessRight {
  role: string
  access: Access[]
}

export interface HierarchyElem {
  id: number
  name: string
  accessRights: AccessRight[]
  buttonList: any[] // TODO 19-01-20 21:12:30
  triggerList: any[] // TODO 19-01-20 21:12:30
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
  isPk: boolean
  isRequired: boolean
  dateFormat?: string
}

export enum TableLinkType {
  simple,
  dropdown,
  linked,
}

export interface LinkedColumn extends Column {
  linkTableName: string
  linkSchema: string
  linkType: TableLinkType
  fkName?: string
  isMultiple: boolean
}

export enum FormLinkType {
  simple,
  dropdown,
  linkedTable,
  linkedForm,
  groupedForm
}

export interface Field {
  tableField: string
  text: string
  isEditable: boolean
}

export interface LinkedField {
  linkType: FormLinkType
  linkSchema: string
  linkTableName: string
}

export interface FormDescription {
  schema: string
  tableName: string
  fields: Array<Field|LinkedField>
}

export interface Table extends HierarchyElem {
  tableName: string
  schema: string
  linesOnPage: number
  columns: Column[]
  formDescription: FormDescription
}

export interface Form extends HierarchyElem {
  formDescription: FormDescription
}

export interface Page extends HierarchyElem {
  [key: string]: any // TODO
}

export interface PrebuiltPage extends HierarchyElem {
  type: string // TODO
}

export interface Hierarchy {
  hierarchy: Array<Section|Table|Form|Page|PrebuiltPage>
  root: number[]
}
