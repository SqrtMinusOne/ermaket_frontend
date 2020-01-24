import { HierarchyElem, Section, Table, Form, PrebuiltPage } from './types'

export function instanceOfSection(obj: HierarchyElem): obj is Section {
  return 'children' in obj
}

export function instanceOfTable(obj: HierarchyElem): obj is Table{
  return 'columns' in obj
}

export function instanceOfForm(obj: HierarchyElem): obj is Form {
  return 'formDescription' in obj
}

export function instanceOfPrebuiltPage(obj: HierarchyElem): obj is PrebuiltPage {
  return 'type' in obj
}
