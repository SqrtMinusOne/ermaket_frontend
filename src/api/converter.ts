import moment from 'moment'
import _ from 'lodash'
import { RowData } from '@/types/tables'
import { Table } from '@/types/user'
import { instanceOfLinkedColumn } from '@/types/user_guards'

export default class Converter {
  public static to_csv(data: RowData[], table: Table) {
    let csv = ''
    const findKey = (key: any) => table.columns.findIndex(
        (column) =>
          column.rowName === key ||
          (instanceOfLinkedColumn(column) && column.fkName === key)
      )
    const keys = Object.keys(data[0]).sort((key1, key2) =>
      findKey(key1) - findKey(key2)
    )
    csv += keys.join(',') + ',\n'

    const formatters: { [key: string]: (arg0: any) => string } = {}
    for (const column of table.columns) {
      const key =
        instanceOfLinkedColumn(column) && !_.isNil(column.fkName)
          ? column.fkName
          : column.rowName
      if (column.type === 'text' || column.type.startsWith('varchar')) {
        formatters[key] = (value) => `"${value.toString().replace(/"/g, '\\"')}"`
      } else if (column.type === 'date' || column.type.startsWith('time')) {
        formatters[key] = (value) => {
          const m = moment(value)
          if (column.dateFormat) {
            return m.format(column.dateFormat)
          } else {
            return m.format()
          }
        }
      } else {
        formatters[key] = (value) => value.toString()
      }
    }

    for (const datum of data) {
      for (const key of keys) {
        csv += formatters[key](datum[key as any]) + ','
      }
      csv += '\n'
    }
    return csv
  }
}
