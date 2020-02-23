import {
  Hierarchy,
  FormDescription,
  Field,
  Table,
  Column,
  FormSchema,
  GenField,
} from '@/types/user'
import { instanceOfLinkedField, instanceOfTable } from '@/types/user_guards'
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
      if (!instanceOfLinkedField(field)) {
        fields.push(this.makeSimpleField(form, field))
      }
      if (_.isNil(groups[field.rowName])) {
        miscGroup = true
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
      schema.groups![_.get(groups, field.model, form.fields.length)].fields.push(field)
    }
    return schema
  }

  private makeSimpleField(form: FormDescription, field: Field): GenField {
    const column = this.getTableField(form.schema, form.tableName, field)
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
      model: field.rowName,
      label: field.text || column.text,
      disabled: !column.isEditable,
      readonly: !column.isEditable || column.isAuto,
      visible: column.isVisible,
      required: column.isRequired,
      default: column.default,
    }

    return gen
  }

  private getTableField(schema: string, tableName: string, field: Field) {
    const table = this.hierarchy.hierarchy.find(
      (elem) =>
        instanceOfTable(elem) &&
        elem.schema === schema &&
        elem.tableName === tableName
    ) as Table
    return table.columns.find((column) => column.rowName === field.rowName)!
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
}
