<template>
  <ag-grid-vue
    :columnDefs="colDefs"
    :gridOptions="gridOptions"
    :rowData="rowData"
    style="height: 400px"
    class="ag-theme-material"
    ref="table"
  />
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue'
import { ColDef, GridOptions } from 'ag-grid-community'
import { Component, Vue, Mixins } from 'vue-property-decorator'

import { TransactionUnit, TransactionType, ValidationError, ErrorSeverity } from '@/types/tables'
import { Table } from '@/types/user'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import ActionRenderer from './change_table/action_render'
import KeyRenderer from './change_table/key_renderer'
import TableHeader from './table/header'
import TableRenderer from './change_table/table_renderer'
import StatusRenderer from './change_table/status_renderer'
import TransactionTypeRenderer from './change_table/type_renderer'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['breakdown', 'getError']),
    ...tableMapper.mapState(['transaction']),
    ...userMapper.mapGetters(['hierarchyElem']),
  },
})

@Component({
  components: {
    AgGridVue,
  },
})
export default class ChangeTable extends Mappers {
  private gridOptions: GridOptions = {
    paginationPageSize: 50,
    pagination: true,
    headerHeight: 40,
    multiSortKey: 'ctrl',
    frameworkComponents: {
      agColumnHeader: TableHeader,
      ActionRenderer,
      KeyRenderer,
      TransactionTypeRenderer,
      TableRenderer,
      StatusRenderer,
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
    },
    getRowClass: this.getRowClass,
    context: {
      parent: this,
    },
  }

  private colDefs: ColDef[] = [
    {
      headerName: 'Table',
      field: 'id',
      cellRenderer: 'TableRenderer',
    },
    {
      headerName: 'Type',
      field: 'type',
      cellRenderer: 'TransactionTypeRenderer',
    },
    {
      headerName: 'Record key',
      field: 'key',
      cellRenderer: 'KeyRenderer',
      headerComponentParams: { isPk: true },
    },
    {
      headerName: 'Status',
      field: 'errors',
      cellRenderer: 'StatusRenderer',
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      lockPinned: true,
      pinned: 'right',
      cellRenderer: 'ActionRenderer',
    },
  ]

  private getRowClass(params: any) {
    if (!params.data) {
      return ''
    }
    if (params.data.errors && params.data.errors.some((err: ValidationError) => err.severity === ErrorSeverity.error)) {
      return 'bg-danger'
    }
    switch (params.data.type) {
      case TransactionType.create:
        return 'bg-info'
      case TransactionType.update:
        return 'bg-secondary text-light'
      case TransactionType.delete:
        return 'bg-warning'
    }
    return ''
  }

  private get rowData() {
    const data: any[] = []
    for (const t of Object.entries(this.transaction)) {
      const [idS, unit]: [any, TransactionUnit] = t
      const id = Number(idS)
      const elem = this.hierarchyElem(id)! as Table
      const local = { name: elem.name, id }
      const isAuto = elem.columns.find((col) => col.isPk)!.isAuto

      for (const [key, update] of Object.entries(unit.update)) {
        data.push({
          ...local,
          key,
          type: TransactionType.update,
          errors: this.getError(id, key),
        })
      }
      for (const [key, del] of Object.entries(unit.delete)) {
        data.push({
          ...local,
          key,
          type: TransactionType.delete,
          errors: this.getError(id, key),
        })
      }
      for (const [key, create] of Object.entries(unit.create)) {
        data.push({
          ...local,
          key,
          isAuto,
          type: TransactionType.create,
          errors: this.getError(id, key),
        })
      }
    }

    return data
  }
}
</script>

<style scoped></style>
