import {
  FormLinkType,
  LinkedField,
  LinkedColumn,
  Hierarchy,
  FormDescription,
  Field,
  Table,
  Column,
  FormSchema,
  GenField,
} from '@/types/user'
import {
  instanceOfLinkedField,
  instanceOfTable,
  instanceOfLinkedColumn,
} from '@/types/user_guards'
import _ from 'lodash'

// tslint:disable-next-line:no-var-requires
const validators = require('vue-form-generator').validators

interface ReGrouped {
  [key: string]: string
}

export default class SchemaGenerator {
  private hierarchy: Hierarchy
  private ignoreGrouped: boolean

  constructor(hierarchy: Hierarchy, ignoreGrouped: boolean = false) {
    this.hierarchy = hierarchy
    this.ignoreGrouped = ignoreGrouped
  }

  public makeSchema(form: FormDescription): FormSchema {
    const grouped: { [key: string]: GenField } = {}
    const groups: ReGrouped = {}
    form.groups.forEach((group, index) => {
      group.rows.forEach((row) => {
        groups[row] = group.legend
      })
    })
    for (const field of form.fields) {
      for (const genField of this.makeFields(
        form,
        groups,
        field,
        Object.keys(grouped)
      )) {
        if (_.isNil(grouped[genField.group])) {
          grouped[genField.group] = []
        }
        grouped[genField.group].push(genField.field)
      }
    }
    if (Object.keys(grouped).length === 1) {
      return {
        fields: grouped[Object.keys(grouped)[0]],
      }
    }
    return {
      groups: Object.entries(grouped).map(([legend, fields]) => ({
        legend,
        fields,
      })),
    }
  }

  private makeFields(
    form: FormDescription,
    groups: ReGrouped,
    field: Field,
    usedGroups: string[]
  ): Array<{ field: GenField; group: string }> {
    const group = groups[field.rowName] || 'Misc'
    if (!instanceOfLinkedField(field)) {
      const { column } = this.getTableField(
        form.schema,
        form.tableName,
        field.rowName
      )
      return [{ field: this.makeSimpleField(column, field), group }]
    }
    if (field.linkType !== FormLinkType.groupedForm || this.ignoreGrouped) {
      return [{ field: this.makeLinkedField(form, field), group }]
    } else {
      // Useless and complicated
      // return this.getGroupedFormFields(form, field, usedGroups)
    }
    return []
  }

  private makeLinkedField(form: FormDescription, field: LinkedField) {
    const { column } = (this.getTableField(
      form.schema,
      form.tableName,
      field.rowName
    ) as unknown) as { column: LinkedColumn; table: Table }
    const linkedTable = this.getTable(column.linkSchema, column.linkTableName)
    switch (field.linkType) {
      case FormLinkType.simple:
        return {
          ...this.makeSimpleField(column, field),
        }
      case FormLinkType.dropdown:
        return {
          type: 'linkedSelect',
          schema: column.linkSchema,
          table: column.linkTableName,
          multiple: column.isMultiple,
          validator: this.getValidator(form, column),
          ...this.getAttrs(column, field),
        }
      case FormLinkType.groupedForm:
      case FormLinkType.linkedTable:
        return {
          type: 'linkedTableModal',
          column,
          table: linkedTable,
          validator: this.getValidator(form, column),
          ...this.getAttrs(column, field),
        }
    }
  }

  private makeSimpleField(column: Column, field: Field): GenField {
    let gen: GenField = {}

    switch (column.type.split('(')[0]) {
      case 'enum':
        gen = { ...gen, ...this.makeEnum(column) }
        break
      case 'decimal':
      case 'int2':
      case 'int4':
      case 'int8':
        gen = {
          ...gen,
          type: 'input',
          inputType: 'number',
          step: 1,
          validator: validators.integer,
        }
        break
      case 'float4':
      case 'float8':
        gen = {
          ...gen,
          type: 'input',
          inputType: 'number',
          step: 0.01,
          validator: validators.double,
        }
        break
      case 'varchar':
        gen = {
          ...gen,
          type: 'input',
          inputType: 'text',
          maxLength: Number(column.type.slice(8, -1)),
          validator: validators.string,
        }
        break
      case 'text':
        gen = {
          ...gen,
          type: 'textArea',
          rows: 4,
          validator: validators.string,
        }
        break
      case 'date':
      case 'time':
      case 'timestamp':
        gen = {
          ...gen,
          type: 'datepicker',
          dateFormat: column.dateFormat,
          validator: validators.required, // TODO
        }
        break
      case 'json':
        // TODO?
        break
    }

    gen = {
      ...gen,
      ...this.getAttrs(column, field),
    }

    return gen
  }
  private getGroupedFormFields(
    form: FormDescription,
    field: LinkedField,
    usedGroups: string[]
  ): Array<{ field: GenField; group: string }> {
    const schema = this.getGroupedFormSchema(form, field, usedGroups)
    const fields = []
    for (const group of schema.groups!) {
      fields.push(...group.fields.map((f) => ({ field: f, group: group.legend })))
    }
    return fields
  }

  private getGroupedFormSchema(
    form: FormDescription,
    field: LinkedField,
    usedGroups: string[]
  ): FormSchema {
    const { column } = (this.getTableField(
      form.schema,
      form.tableName,
      field.rowName
    ) as unknown) as { column: LinkedColumn; table: Table }
    const linkedTable = this.getTable(column.linkSchema, column.linkTableName)!
    const generator = new SchemaGenerator(this.hierarchy, true)
    let linkedSchema = generator.makeSchema(linkedTable.formDescription!)
    if (!_.isNil(linkedSchema.fields)) {
      linkedSchema = {
        groups: [
          {
            legend: linkedTable.name,
            fields: linkedSchema.fields,
          },
        ],
      }
    }
    const used = new Set(usedGroups)
    const rename = linkedSchema.groups!.some((group) => used.has(group.legend))
    linkedSchema.groups = linkedSchema.groups!.map((group) => ({
      fields: group.fields.map((f) => ({
        ...f,
        model: `${field.rowName}.${f.model}`
      })),
      legend: rename ? `${linkedTable.name}: ${group.legend}` : group.legend,
    }))
    return linkedSchema
  }

  private getTable(schema: string, tableName: string) {
    return this.hierarchy.hierarchy.find(
      (elem) =>
        instanceOfTable(elem) &&
        elem.schema === schema &&
        elem.tableName === tableName
    ) as Table
  }

  private getTableField(schema: string, tableName: string, rowName?: string) {
    const table = this.getTable(schema, tableName)
    return {
      table,
      column: table.columns.find((column) => column.rowName === rowName)!,
    }
  }

  private makeEnum(column: Column) {
    const opts = column.type
      .slice(5, -1)
      .split(',')
      .map((attr) => attr.trim().slice(1, -1))
    return {
      type: 'select',
      values: opts,
    }
  }

  private getValidator(form: FormDescription, column: LinkedColumn) {
    const { column: fkColumn } = this.getTableField(
      form.schema,
      form.tableName,
      column.fkName
    )
    if (!fkColumn) {
      if (column.isMultiple) {
        return validators.array
      }
      return validators.required
    }
    const type = fkColumn.type
    switch (type.split('(')[0]) {
      case 'decimal':
      case 'int2':
      case 'int4':
      case 'int8':
        return validators.integer
      case 'float4':
      case 'float8':
        return validators.double
      case 'varchar':
      case 'text':
        return validators.string
      case 'date':
      case 'time':
      case 'timestamp':
        return validators.required // TODO
    }
  }

  private getAttrs(column: Column, field: Field) {
    return {
      model: (column as LinkedColumn).fkName || field.rowName,
      label: field.text || column.text,
      disabled: !column.isEditable,
      readonly: !column.isEditable || column.isAuto,
      visible: column.isVisible,
      required: column.isRequired,
      default: column.default,
    }
  }
}
