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

import { TransactionUnit, TransactionType } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import ActionRenderer from './change_table/action_render'
import TableHeader from './table/header'
import TableRenderer from './change_table/table_renderer'
import TransactionTypeRenderer from './change_table/type_renderer'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['breakdown']),
    ...tableMapper.mapState(['transaction']),
    ...userMapper.mapGetters(['hierarchyElem'])
  }
})

@Component({
  components: {
    AgGridVue
  }
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
      TransactionTypeRenderer,
      TableRenderer,
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
    },
    getRowClass: this.getRowClass,
    context: {
      parent: this
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
      headerComponentParams: { isPk: true }
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      lockPinned: true,
      pinned: 'right',
      cellRenderer: 'ActionRenderer',
    }
  ]

  private getRowClass(params: any) {
    if (!params.data) {
      return ''
    }
    switch (params.data.type) {
      case TransactionType.create:
        return 'bg-info'
      case TransactionType.update:
        return 'bg-warning'
      case TransactionType.delete:
        return 'bg-danger'
    } 
    return ''
  }

  private get rowData() {
    const data: any[] = []
    for (const t of Object.entries(this.transaction)) {
      let [id, unit]: [any, TransactionUnit] = t
      id = Number(id)
      const elem = this.hierarchyElem(id)!
      const local = { name: elem.name, id }

      for (const [key, update] of Object.entries(unit.update)) {
        data.push({ ...local, key, type: TransactionType.update })
      }
      for (const [key, del] of Object.entries(unit.delete)) {
        data.push({ ...local, key, type: TransactionType.delete })
      }
      for (const [key, create] of Object.entries(unit.create)) {
        data.push({ ...local, key, type: TransactionType.create })
      }
    }

    return data
  }
}

</script>

<style scoped>

</style>