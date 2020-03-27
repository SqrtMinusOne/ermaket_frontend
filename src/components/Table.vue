<template>
  <ag-grid-vue
    :columnDefs="columnDefs"
    :gridOptions="gridOptions"
    @grid-ready="onGridReady"
    @cell-value-changed="onValueChanged"
    @pagination-changed="onModelUpdated"
    @sort-changed="onTableSortChanged"
    @filter-changed="onTableFilterChanged"
    class="ag-theme-material"
    ref="table"
  />
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { AgGridVue } from 'ag-grid-vue'
import {
  CellValueChangedEvent,
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  RowNode,
} from 'ag-grid-community'
import _ from 'lodash'

import { instanceOfLinkedColumn, instanceOfTable } from '@/types/user_guards'
import { Column, LinkedColumn, Table, TableLinkType, Access } from '@/types/user'
import { Criterion, FilterObject, Operator, Order } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import ActionRenderer from './table/action_renderer'
import BooleanRenderer from './table/boolean_renderer'
import BootstrapEditor from './table/bootstrap_editor'
import CheckboxRenderer from './table/checkbox_renderer'
import DatePickerEditor from './table/datepicker_editor'
import GeneralRenderer from './table/general_renderer'
import LinkedEditor, { MakeLinkedSelectSetter } from './table/linked_editor'
import LinkedRenderer from './table/linked_renderer'
import LinkedTableRenderer from './table/linked_table'
import TableHeader from './table/header'
import TimestampRenderer from './table/timestamp_renderer'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapState(['loaded', 'transaction', 'errors']),
    ...tableMapper.mapGetters(['isToDelete', 'isToUpdate', 'hasErrors', 'isToCreate']),
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRows', 'setRecordUpdate', 'setRowUpdate']),
  },
  name: 'TableComponent',
})

@Component({
  components: {
    AgGridVue,
  },
  model: {
    prop: 'keys',
    event: 'change'
  }
})
export default class TableComponent extends Mappers {
  public gridApi?: GridApi
  public columnApi?: ColumnApi

  @Prop({ type: Boolean, default: false }) public readonly autoLoadLinked!: boolean

  @Prop({ type: Number, required: true }) private readonly id!: number
  @Prop({ type: Boolean, default: false }) private fill!: boolean
  @Prop({ type: Object }) private readonly filterModel?: FilterObject
  @Prop({ type: Object }) private readonly sortModel?: Order
  @Prop({ type: Boolean, default: false }) private readonly noEdit!: boolean
  @Prop({ type: Object }) private readonly keysParams?: {
    edit: boolean
    column: LinkedColumn
  }

  @Prop({ type: Array }) private readonly keys?: any[] | any

  private error?: string
  private onResize: any
  private linkedOpened: {
    [key: string]: LinkedColumn
    [key: number]: LinkedColumn
  } = {}
  private resetHeight: boolean = false
  private defaultRowHeight: number = 48
  private actionNumber: number = 0

  private gridOptions: GridOptions = {
    rowModelType: 'infinite',
    rowBuffer: 20,
    paginationPageSize: 100,
    pagination: true,
    frameworkComponents: {
      ActionRenderer,
      BooleanRenderer,
      BootstrapEditor,
      CheckboxRenderer,
      DatePickerEditor,
      LinkedEditor,
      LinkedRenderer,
      LinkedTableRenderer,
      TimestampRenderer,
      GeneralRenderer,
      agColumnHeader: TableHeader,
    },
    multiSortKey: 'ctrl',
    getRowClass: this.getRowClass,
    context: {
      parent: this
    },
    fullWidthCellRenderer: 'LinkedTableRenderer',
    isFullWidthCell: this.isFullWidth,
    getRowHeight: this.getRowHeight,
    headerHeight: 40,
  }

  public onLinkedTable(key: any, column: LinkedColumn) {
    this.linkedOpened[key] = column
    this.update()
  }

  public update() {
    if (this.gridApi) {
      const filterModel = this.gridApi.getFilterModel()
      const sortModel = this.gridApi.getSortModel()
      this.gridApi.refreshInfiniteCache()
      this.$nextTick(() => {
        if (!_.isEmpty(filterModel)) {
          this.gridApi!.setFilterModel(filterModel)
        }
        if (!_.isEmpty(sortModel)) {
          this.gridApi!.setSortModel(sortModel)
        }
      })
    }
  }

  public onLinkedClose(key: any) {
    delete this.linkedOpened[key]
    this.resetHeight = true
    this.update()
  }

  public getLinked(key: any) {
    return this.linkedOpened[key]
  }

  public setRowsHeight() {
    let gridHeight = 0
    let clipperHeight = 0
    if (!this.gridOptions.api) {
      return
    }

    const startIndex =
      this.gridOptions.api.paginationGetCurrentPage() *
      this.gridOptions.api.paginationGetPageSize()
    const endIndex = startIndex + this.gridOptions.api.paginationGetPageSize()
    this.gridOptions.api.forEachNode((node: RowNode) => {
      let rowHeight
      if (node.rowIndex >= startIndex && node.rowIndex < endIndex) {
        rowHeight = (this.gridOptions.getRowHeight as any)(node)
        clipperHeight += rowHeight
      } else {
        rowHeight = this.defaultRowHeight
      }
      node.setRowHeight(rowHeight)
      node.setRowTop(gridHeight)
      gridHeight += rowHeight
    })
    if (!gridHeight) {
      return
    }

    const elements = this.$el.getElementsByClassName(
      'ag-center-cols-container'
    ) as any
    if (elements) {
      elements[0].style.height = `${gridHeight}px`
    }

    const clippers = this.$el.getElementsByClassName(
      'ag-center-cols-clipper'
    ) as any
    if (clippers) {
      clippers[0].style.height = `${clipperHeight}px`
    }
  }

  public onKeySet(key: any, state: boolean) {
    if (this.keys === undefined) {
      return
    }
    if (!_.isArray(this.keys)) {
      this.$emit('change', key)
    }
    const keys = this.keys as any[]
    if (!state) {
      const index = keys.indexOf(key)
      if (index >= 0) {
        const newKeys = keys.filter((v) => v !== key)
        this.$emit('change', newKeys)
      }
    } else {
      const index = keys.indexOf(key)
      if (index < 0) {
        const newKeys = keys.slice()
        newKeys.push(key)
        this.$emit('change', newKeys)
      }
    }
  }

  public onUpdate() {
    this.setActionColumnWidth()
  }

  public onFormEdit(key: string | number, node: RowNode) {
    this.$emit('formEdit', key, node)
  }

  public setTableHeight() {
    if (this.fill) {
      window.scrollTo(0, 0)
      const element = this.$el as any
      const viewport = element.getBoundingClientRect()
      const height = window.innerHeight - viewport.top - 20
      element.style.height = `${height}px`
    }
  }

  private getRowHeight(node: RowNode) {
    if (this.isFullWidth(node)) {
      return 350
    }
    return this.defaultRowHeight
  }

  private onModelUpdated() {
    if (this.resetHeight || !_.isEmpty(this.linkedOpened)) {
      this.setRowsHeight()
      this.resetHeight = false
    }
  }

  private isFullWidth(row: RowNode) {
    return Boolean(row.data && row.data._linked)
  }

  @Watch('id')
  private onIdChanged() {
    this.initTable()
  }

  @Watch('filterModel')
  private onFilterChanged() {
    if (this.gridApi) {
      this.gridApi.setFilterModel(this.filterModel)
    }
  }

  @Watch('sortModel')
  private onSortChanged() {
    if (this.gridApi) {
      this.gridApi.setSortModel(this.sortModel)
    }
  }

  @Watch('keysParams', { deep: true })
  private onKeysParamsChanged() {
    this.update()
  }

  @Watch('autoLoadLinked')
  private onAutoLoadLinkedChanged() {
    if (this.gridApi) {
      this.gridApi.refreshCells({ force: true })
    }
  }

  private onTableSortChanged() {
    this.$emit('modelsChanged')
  }

  private onTableFilterChanged() {
    this.$emit('modelsChanged')
  }

  private created() {
    this.onResize = this.setTableHeight.bind(this)
    this.actionNumber = this.getActionNumber()
  }

  private onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api
    this.columnApi = params.columnApi
    this.initTable()
    if (this.fill) {
      this.setTableHeight()
      window.addEventListener('resize', this.onResize, { passive: true })
    }
  }

  private get elem(): Table {
    return this.hierarchyElem(this.id) as Table
  }

  private get pk(): Column {
    return this.elem.columns.find((col) => col.isPk) as Column
  }

  private initTable() {
    const elem = this.elem
    this.linkedOpened = {}
    this.gridOptions.fullWidthCellRendererParams = {
      table: this.elem as Table,
      pk: this.pk,
    }
    if (!instanceOfTable(elem)) {
      this.error = 'This table does not exist'
      return
    }
    this.gridOptions.paginationPageSize = elem.linesOnPage
    if (this.gridApi) {
      if (!_.isEmpty(this.gridApi.getFilterModel())) {
        this.gridApi.setFilterModel(null)
      }
      if (!_.isEmpty(this.gridApi.getSortModel())) {
        this.gridApi.setSortModel(null)
      }
      this.gridApi.setDatasource(this.makeDataSource())
      if (this.filterModel) {
        this.gridApi.setFilterModel(this.filterModel)
      }
      if (this.sortModel) {
        this.gridApi.setSortModel(this.sortModel)
      }
    }
    if (this.columnApi) {
      this.columnApi.resetColumnState()
    }
    this.setActionColumnWidth()
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  }

  private get columnDefs(): ColDef[] {
    const defs: ColDef[] = []
    const table = this.elem
    if (!table) {
      return defs
    }
    const pk = this.pk
    if (!_.isNil(this.keys) && this.keysParams && this.keysParams.edit) {
      defs.push(this.getCheckboxColumn())
    }
    for (const column of table.columns) {
      if (!column.isVisible) {
        continue
      }
      defs.push(this.getColDef(column))
    }
    if (this.getActionNumber() > 0) {
      defs.push(this.getActionColumn())
    }
    return defs
  }

  private getColDef(column: Column): ColDef {
    return {
      headerName: column.text,
      field: column.rowName,
      resizable: true,
      sortable: column.isSort && Boolean(column.type),
      filter: this.getFilter(column),
      headerComponentParams: {
        isPk: column.isPk,
        columnElem: column,
        table: this.elem,
        pk: this.pk,
      },
      editable: this.getIsEditable(column),
      ...this.getRenderer(column),
      ...this.getEditor(column, this.elem),
    }
  }

  private getCheckboxColumn() {
    return {
      headerName: this.keysParams!.column.text,
      field: '_key',
      resizable: true,
      sortable: false,
      lockPinned: true,
      pinned: 'left',
      filter: false,
      headerComponentParams: { isPk: false, table: this.elem, pk: this.pk },
      cellRendererParams: { table: this.elem, pk: this.pk },
      cellRenderer: 'CheckboxRenderer',
      editable: false,
    }
  }

  private getActionColumn() {
    return {
      headerName: 'Actions',
      colId: '_actions',
      resizable: true,
      sortable: false,
      lockPinned: true,
      pinned: 'right',
      filter: false,
      headerComponentParams: { isPk: false, table: this.elem, pk: this.pk },
      cellRendererParams: { table: this.elem, pk: this.pk, isLinked: !_.isNil(this.keys) },
      cellRenderer: 'ActionRenderer',
      editable: false,
      width: 49 * this.getActionNumber() + 43
    }
  }

  private getActionNumber() {
    let n = 0
    if (this.elem.userAccess.has(Access.delete)) {
      n++
    }
    if (this.elem.userAccess.has(Access.change) && !_.isNil(this.elem.formDescription)) {
      n++
    }
    if (this.transaction[this.elem.id]) {
      n++
    }
    if (!_.isEmpty(this.errors[this.elem.id])) {
      n++
    }
    if (!_.isNil(this.keys)) {
      n++
    }
    return n
  }

  private getIsEditable(column: Column) {
    if (this.noEdit || column.isAuto || column.type === 'boolean') {
      return false
    }
    if (!instanceOfLinkedColumn(column)) {
      return column.isEditable
    }
    if (column.linkType !== TableLinkType.linked) {
      return column.isEditable
    }
    return false
  }

  private getRenderer(column: Column) {
    const params = {
      columnElem: column,
      table: this.elem,
      pk: this.pk
    }
    let renderer: string = 'GeneralRenderer'
    if (instanceOfLinkedColumn(column)) {
      renderer = 'LinkedRenderer'
    }
    switch (column.type) {
      case 'date':
      case 'time':
      case 'timestamp':
        renderer = 'TimestampRenderer'
      case 'boolean':
        renderer = 'BooleanRenderer'
    }
    return {
      cellRendererParams: params,
      cellRenderer: renderer
    }
  }

  private getEditor(column: Column, table: Table) {
    const pk = this.pk
    const params = { columnElem: column, table, pk }

    if (instanceOfLinkedColumn(column)) {
      const valueSetter = MakeLinkedSelectSetter(
        column,
        (key: any, data: any, index?: number) => {
          this.setRecordUpdate({ id: table.id, key, data, index })
        },
        pk
      )
      switch (column.linkType) {
        case TableLinkType.linked:
          return
        case TableLinkType.combined:
        case TableLinkType.dropdown:
          return {
            cellEditor: 'LinkedEditor',
            cellEditorParams: params,
            valueSetter,
          }
        case TableLinkType.simple: // Process as sumple column
      }
    }

    if (column.type && column.type.startsWith('enum')) {
      const opts = column.type
        .slice(5, -1)
        .split(',')
        .map((attr) => attr.trim().slice(1, -1))
      return {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          ...params,
          values: opts,
        },
      }
    }

    switch (column.type) {
      case 'text':
        return {
          cellEditor: 'agLargeTextCellEditor',
          cellEditorParams: params,
        }
      case 'timestamp':
        return {
          cellEditor: 'DatePickerEditor',
          cellEditorParams: params,
        }
      default:
        return {
          cellEditor: 'BootstrapEditor',
          cellEditorParams: params,
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

  private getRowClass(params: any) {
    if (!params.data) {
      return ''
    }
    const key = params.data[this.pk.rowName]
    if (this.hasErrors(this.id, key)) {
      return 'bg-danger'
    }
    if (this.isToDelete(this.id, key)) {
      return 'bg-warning'
    }
    if (this.isToUpdate(this.id, key)) {
      return 'bg-secondary text-light'
    }
    if (this.isToCreate(this.id, key)) {
      return 'bg-info'
    }
    return ''
  }

  private onValueChanged(event: CellValueChangedEvent) {
    if (!(event.oldValue !== undefined && event.oldValue === event.newValue)) {
      if (event.data._index !== undefined) {
        this.setRowUpdate({ id: this.id, index: event.data._index, data: event.data })
      } else {
        const oldData = { ...event.data }
        oldData[event.column.getUserProvidedColDef().cellRendererParams.columnElem.rowName] = event.oldValue
        this.setRowUpdate({ id: this.id, oldData, data: event.data })
      }
    }
    this.setActionColumnWidth()
    this.gridApi!.redrawRows({ rowNodes: [event.node] })
  }

  private setActionColumnWidth() {
    this.columnApi!.setColumnWidth('_actions', 50 * this.getActionNumber() + 40)
  }

  private makeDataSource(): IDatasource {
    const self = this
    return {
      rowCount: undefined,
      getRows(params: IGetRowsParams) {
        if (self.checkReturnEmpty()) {
          params.successCallback([], 0)
          return
        }
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
            data = _.cloneDeep(data)
            if (!filter && self.loaded[self.id]) {
              this.rowCount = self.loaded[self.id].rowCount!
            } else {
              if (data.length < params.endRow - params.startRow) {
                this.rowCount = params.startRow + data.length
              } else {
                this.rowCount = undefined
              }
            }
            if (!filter && !order) {
              self.injectIndices(data, params.startRow)
            }
            if (!_.isEmpty(self.linkedOpened)) {
              data = self.injectLinkedRows(data)
              // if (!_.isNil(this.rowCount)) {
              //   this.rowCount += self.linkedOpened.length
              // }
            }
            if (!_.isNil(self.keys) && self.keysParams && self.keysParams.edit) {
              data = self.injectKeys(data)
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
      const column = (this.columnApi as ColumnApi)
        .getColumn(sort.colId)
        .getUserProvidedColDef().cellRendererParams.columnElem as Column
      if (sort.sort === 'asc') {
        return column.rowName
      } else {
        return `-${column.rowName}`
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
    if (!_.isNil(this.keys) && this.keysParams && !this.keysParams.edit) {
      obj.or.push(...this.addKeysFilter())
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

  private addKeysFilter(): Criterion[] {
    if (!_.isNil(this.keys)) {
      if (_.isArray(this.keys)) {
        return this.keys.map((key) => {
          return {
            field_name: this.pk.rowName,
            operator: Operator.equals,
            field_value: key,
          }
        })
      } else {
        return [{
            field_name: this.pk.rowName,
            operator: Operator.equals,
            field_value: this.keys,
          }]
      }
    }
    return []
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

  private injectIndices(data: any[], start: number) {
    const delta = this.transaction[this.id] ? Object.keys(this.transaction[this.id].create).length : 0
    data.forEach((datum, i) => {
      datum._index = start + Number(i) - delta
    })
  }

  private injectLinkedRows(data: any[]): any[] {
    const newData: any = []
    for (const datum of data) {
      newData.push(datum)
      const col = this.linkedOpened[datum[this.pk.rowName]]
      if (col) {
        newData.push({ ...datum, _linked: col })
      }
    }
    return newData
  }

  private injectKeys(data: any[]): any[] {
    const keys = new Set(this.keys)
    return data.map((datum) => {
      if (keys.has(datum[this.pk.rowName])) {
        return { _key: true, ...datum }
      }
      return { _key: false, ...datum }
    })
  }

  private checkReturnEmpty() {
    return !_.isNil(this.keys) && !this.keysParams?.edit && _.isEmpty(this.keys)
  }
}
</script>

<style lang="scss"></style>
