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
import { Component, Vue, Prop } from 'vue-property-decorator'

import TableHeader from './table/header'

@Component({
  components: {
    AgGridVue,
  },
})
export default class ResultTable extends Vue {
  @Prop({ type: Array }) private readonly keys!: string[]
  @Prop({ type: Array }) private readonly rows!: any[][]

  private gridOptions: GridOptions = {
    paginationPageSize: 50,
    pagination: true,
    headerHeight: 40,
    multiSortKey: 'ctrl',
    frameworkComponents: {
      agColumnHeader: TableHeader,
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
    },
    context: {
      parent: this,
    },
  }

  private get colDefs(): ColDef[] {
    return this.keys.map((key) => ({
      headerName: key,
      field: key
    }))
  }

  private get rowData() {
    return this.rows.map((row) => {
      const res: any = {}
      this.keys.forEach((key, index) => {
        res[key] = row[index]
      })
      return res
    })
  }
}
</script>
