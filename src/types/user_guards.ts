import {
  HierarchyElem,
  Section,
  Table,
  Form,
  PrebuiltPage,
  Page,
  Column,
  LinkedColumn,
  Field,
  LinkedField,
} from './user'

export function instanceOfSection(obj?: HierarchyElem): obj is Section {
  return obj ? 'children' in obj : false
}

export function instanceOfTable(obj?: HierarchyElem): obj is Table {
  return obj ? 'columns' in obj : false
}

export function instanceOfForm(obj?: HierarchyElem): obj is Form {
  return obj && !instanceOfTable(obj) ? 'formDescription' in obj : false
}

export function instanceOfPage(obj?: HierarchyElem): obj is Page {
  return obj ? 'pageName' in obj : false
}

export function instanceOfPrebuiltPage(
  obj?: HierarchyElem
): obj is PrebuiltPage {
  return obj ? 'type' in obj : false
}

export function instanceOfLinkedColumn(obj?: Column): obj is LinkedColumn {
  return obj ? 'linkTableName' in obj : false
}

export function instanceOfLinkedField(obj?: Field): obj is LinkedField {
  return obj ? 'linkType' in obj : false
}
