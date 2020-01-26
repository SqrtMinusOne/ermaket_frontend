import { HierarchyElem, Section, Table, Form, PrebuiltPage, Column, LinkedColumn } from './user'

export function instanceOfSection(obj?: HierarchyElem): obj is Section {
  return obj ? 'children' in obj : false
}

export function instanceOfTable(obj?: HierarchyElem): obj is Table{
  return obj ? 'columns' in obj : false
}

export function instanceOfForm(obj?: HierarchyElem): obj is Form {
  return obj ? 'formDescription' in obj : false
}

export function instanceOfPrebuiltPage(obj?: HierarchyElem): obj is PrebuiltPage {
  return obj ? 'type' in obj : false
}

export function instanceOfLinkedColumn(obj?: Column): obj is LinkedColumn {
  return obj ? 'linkTableName' in obj : false
}
