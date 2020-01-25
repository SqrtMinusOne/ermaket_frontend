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
import { instanceOfTable } from '@/types/user_guards'
import { Table } from '@/types/user'
import TableHeader from './table/header'
import {
  IDatasource,
  IGetRowsParams,
  GridOptions,
  ColDef,
  GridReadyEvent,
  GridApi,
  ColumnApi,
} from 'ag-grid-community'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

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
    }
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
        sortable: column.isSort,
        editable: column.isEditable,
        filter: column.isFilter,
        resizable: true,
        headerComponentParams: { isPk: column.isPk }
        // eaderComponent: TableHeader,
      }
      defs.push(def)
    }
    return defs
  }

  private makeDataSource(): IDatasource {
    const self = this
    return {
      rowCount: undefined,
      getRows(params: IGetRowsParams) {
        const payload = {
          id: self.id,
          rowStart: params.startRow,
          rowEnd: params.endRow,
        }
        self
          .fetchRows(payload)
          .then((data) => {
            this.rowCount = self.loaded[self.id].rowCount
            params.successCallback(data, this.rowCount)
          })
          .catch(() => {
            params.failCallback()
          })
      },
    }
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
