<template>
  <ag-grid-vue
    :columnDefs="columnDefs"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
    class="ag-theme-material"
    :style="tableStyle"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { AgGridVue } from 'ag-grid-vue'
import {
  IDatasource,
  IGetRowsParams,
  GridOptions,
  ColDef,
  GridReadyEvent,
  GridApi,
  ColumnApi,
} from 'ag-grid-community'

import { instanceOfTable, instanceOfLinkedColumn } from '@/types/user_guards'
import { Table, Column, LinkedColumn, TableLinkType } from '@/types/user'
import { FilterObject, Order, Operator, Criterion } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import TableHeader from './table/header'
import LinkedRenderer from './table/linked_renderer'
import TimestampRenderer from './table/timestamp_renderer'
import BootstrapEditor from './table/bootstrap_editor'
import DatePickerEditor from './table/datepicker_editor'


const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapState(['loaded', 'transaction']),
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRows']),
  },
})

@Component({
  components: {
    AgGridVue,
  },
})
export default class TableComponent extends Mappers {
  @Prop({ type: Number, required: true }) private readonly id!: number

  private error?: string
  private gridApi?: GridApi
  private columnApi?: ColumnApi

  private gridOptions: GridOptions = {
    rowModelType: 'infinite',
    rowBuffer: 0,
    paginationPageSize: 100,
    pagination: true,
    frameworkComponents: {
      agColumnHeader: TableHeader,
      LinkedRenderer,
      BootstrapEditor,
      DatePickerEditor,
      TimestampRenderer,
    },
    multiSortKey: 'ctrl',
    // floatingFilter: true,
  }

  @Watch('id')
  private onIdChanged() {
    this.initTable()
  }

  private initTable() {
    const elem = this.hierarchyElem(this.id)
    if (!instanceOfTable(elem)) {
      this.error = 'This table does not exist'
      return
    }
    this.gridOptions.paginationPageSize = elem.linesOnPage
    if (this.gridApi) {
      this.gridApi.setDatasource(this.makeDataSource())
    }
  }

  private created() {
    if (!instanceOfTable(this.hierarchyElem(this.id))) {
      this.$router.push('/page_not_exists')
    }
  }

  private get columnDefs(): ColDef[] {
    const defs: ColDef[] = []
    const table = this.hierarchyElem(this.id) as Table
    if (!table) {
      return defs
    }
    for (const column of table.columns) {
      const def: ColDef = {
        headerName: column.text,
        field: column.rowName,
        sortable: column.isSort && Boolean(column.type),
        editable: this.getIsEditable(column),
        filter: this.getFilter(column),
        resizable: true,
        headerComponentParams: { isPk: column.isPk },
        cellRendererParams: { columnElem: column },
        cellRenderer: this.getRenderer(column),
        ...this.getEditor(column)
      }
      defs.push(def)
    }
    return defs
  }
  
  private getIsEditable(column: Column) {
    if (!instanceOfLinkedColumn(column)) {
      return column.isEditable
    }
    if (column.fkName && column.linkType !== TableLinkType.linked) {
      return column.isEditable
    }
    return false
  }

  private getRenderer(column: Column) {
    if (instanceOfLinkedColumn(column)) {
      return 'LinkedRenderer'
    }
    switch (column.type) {
      case 'date':
      case 'time':
      case 'timestamp':
        return 'TimestampRenderer'
    }
    return undefined
  }

  private getEditor(column: Column) {
    if (!column.type) {
      return
    }
    const params = {
      columnElem: column
    }
    if (column.type.startsWith('enum')) {
      const opts = column.type.slice(5, -1).split(',').map((attr) => attr.trim().slice(1, -1))
      return {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          ...params,
          values: opts
        }
      }
    }
    switch (column.type) {
      case 'text':
        return {
          cellEditor: 'agLargeTextCellEditor',
          cellEditorParams: params
        }
      case 'timestamp':
        return {
          cellEditor: 'DatePickerEditor',
          cellEditorParams: params
        }
      default:
        return {
          cellEditor: 'BootstrapEditor',
          cellEditorParams: params
        }
    }
  }

  private getFilter(column: Column | LinkedColumn) {
    if (!column.type) {
      return false
    }
    if (column.type.match(/((float|int)\d*|bool|decimal.*)/)) {
      return 'agNumberColumnFilter'
    }
    if (column.type.match(/(date|timestamp)/)) {
      return 'agDateColumnFilter'
    }
    return 'agTextColumnFilter'
  }

  private makeDataSource(): IDatasource {
    const self = this
    return {
      rowCount: undefined,
      getRows(params: IGetRowsParams) {
        const filter = self.castFilterModel(params.filterModel)
        const order = self.castSortModel(params.sortModel)
        const payload = {
          id: self.id,
          rowStart: params.startRow,
          rowEnd: params.endRow,
          filter,
          order,
        }
        self
          .fetchRows(payload)
          .then((data) => {
            if (!filter && self.loaded[self.id]) {
              this.rowCount = self.loaded[self.id].rowCount
            } else {
              if (data.length < params.endRow - params.startRow) {
                this.rowCount = params.startRow + data.length
              } else {
                this.rowCount = undefined
              }
            }
            params.successCallback(data, this.rowCount)
          })
          .catch((err) => {
            console.error(err)
            params.failCallback()
          })
      },
    }
  }

  private castSortModel(model: any[]): Order | undefined {
    if (model.length === 0) {
      return
    }
    return model.map((sort: any) => {
      if (sort.sort === 'asc') {
        return sort.colId
      } else {
        return `-${sort.colId}`
      }
    })
  }

  private castFilterModel(model: any): FilterObject | undefined {
    const obj: any = {
      and: [],
      or: [],
    }
    for (const [column, filter] of Object.entries(model)) {
      const { and, or } = this.castFilterColumn(column, filter)
      if (and) {
        obj.and.push(...and)
      }
      if (or) {
        obj.or.push(...or)
      }
    }
    if (obj.and.length + obj.or.length === 0) {
      return undefined
    }
    return obj
  }

  private castFilterColumn(column: string, filter: any): FilterObject {
    if ('operator' in filter) {
      const noRange = filter.operator === 'or'
      const conditions = [
        ...this.castCondition(column, filter.condition1, noRange),
        ...this.castCondition(column, filter.condition2, noRange),
      ]
      if (filter.operator === 'AND') {
        return {
          and: conditions,
        }
      } else {
        return {
          or: conditions,
        }
      }
    } else {
      return { and: this.castCondition(column, filter) }
    }
  }

  private castCondition(
    column: string,
    condition: any,
    noRange: boolean = false
  ): Criterion[] {
    const operators = {
      equals: Operator.equals,
      notEqual: Operator.not_equals,
      contains: Operator.icontains,
      startsWith: Operator.istartswith,
      endsWith: Operator.iendswith,
      lessThan: Operator.less_than,
      lessThanOrEqual: Operator.less_than_equals,
      greaterThan: Operator.greater_than,
      greaterThanOrEqual: Operator.greater_than_equals,
      empty: Operator.isnotnull,
    }
    if (condition.type === 'inRange' && !noRange) {
      return [
        {
          field_name: column,
          operator: Operator.greater_than_equals,
          field_value: condition.filter || condition.dateFrom,
        },
        {
          field_name: column,
          operator: Operator.less_than_equals,
          field_value: condition.filterTo || condition.dateTo,
        },
      ]
    } else if (condition.type === 'inRange' && noRange) {
      this.error = 'Range is not supported with OR'
    }
    const op = operators[condition.type as keyof typeof operators]
    if (op === undefined) {
      this.error = `Operator ${condition.type} is not supported`
      console.warn(this.error)
      return []
    }
    return [
      {
        field_name: column,
        operator: op,
        field_value: condition.filter || condition.dateFrom,
      },
    ]
  }

  private onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api
    this.columnApi = params.columnApi
    this.initTable()
  }

  private get tableStyle() {
    return {
      width: '100%',
      height: '400px',
    }
  }
}
</script>

<style lang="scss"></style>
