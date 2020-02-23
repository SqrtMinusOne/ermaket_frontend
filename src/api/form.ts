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
import { instanceOfLinkedField, instanceOfTable, instanceOfLinkedColumn } from '@/types/user_guards'
import _ from 'lodash'

// tslint:disable-next-line:no-var-requires
const validators = require('vue-form-generator').validators

export default class SchemaGenerator {
  private hierarchy: Hierarchy

  constructor(hierarchy: Hierarchy) {
    this.hierarchy = hierarchy
  }

  public makeSchema(form: FormDescription): FormSchema {
    const groups: { [key: string]: number } = {}
    form.groups.forEach((group, index) => {
      group.rows.forEach((row) => {
        groups[row] = index
      })
    })
    const fields: GenField[] = []
    let miscGroup = false
    for (const field of form.fields) {
      const f = this.makeGenField(form, field)
      if (f) {
        fields.push(f)
        if (_.isNil(groups[field.rowName])) {
          miscGroup = true
        }
      }
    }

    if (_.isEmpty(groups)) {
      return {
        fields,
      }
    }
    const schema: FormSchema = {
      groups: form.groups.map((group) => ({
        legend: group.legend,
        fields: [],
      })),
    }
    if (miscGroup) {
      schema.groups!.push({ legend: 'Misc', fields: [] })
    }
    for (const field of fields) {
      schema.groups![_.get(groups, field.model, schema.groups!.length - 1)].fields.push(field)
    }
    return schema
  }

  private makeGenField(form: FormDescription, field: Field) {
    if (!instanceOfLinkedField(field)) {
      const column = this.getTableField(form.schema, form.tableName, field.rowName)
      return this.makeSimpleField(column, field)
    } else {
      const column = this.getTableField(form.schema, form.tableName, field.rowName) as LinkedColumn
      const fkColumn = this.getTableField(form.schema, form.tableName, column.fkName)
      switch (field.linkType) {
        case FormLinkType.simple:
          return {
            ...this.makeSimpleField(fkColumn, field),
          }
        case FormLinkType.dropdown:
          return {
            type: 'linkedSelect',
            schema: column.linkSchema,
            table: column.linkTableName,
            multiple: column.isMultiple,
            validator: this.getValidator(form, column),
            ...this.getAttrs(column, field)
          }
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
          validator: validators.date,
        }
        break
      case 'json':
        // TODO?
        break
    }

    gen = {
      ...gen,
      ...this.getAttrs(column, field)
    }

    return gen
  }

  private getTableField(schema: string, tableName: string, rowName?: string) {
    const table = this.hierarchy.hierarchy.find(
      (elem) =>
        instanceOfTable(elem) &&
        elem.schema === schema &&
        elem.tableName === tableName
    ) as Table
    return table.columns.find((column) => column.rowName === rowName)!
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
    const fkColumn = this.getTableField(form.schema, form.tableName, column.fkName)
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
        return validators.date
    }
  }
  
  private getAttrs(column: Column, field: Field) {
    return {
      model: field.rowName,
      label: field.text || column.text,
      disabled: !column.isEditable,
      readonly: !column.isEditable || column.isAuto,
      visible: column.isVisible,
      required: column.isRequired,
      default: column.default,
    }
  }
}
