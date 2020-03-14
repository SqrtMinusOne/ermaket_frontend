import { Component, Mixins, Vue } from 'vue-property-decorator'
import _ from 'lodash'
import { saveAs } from 'file-saver'

import TableComponent from '@/components/Table.vue'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import { Table } from '@/types/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['tableToCSV']),
  },
})

@Component
export default class TableControls extends Mappers {
  public wasSorted: boolean = false
  public autoLoad: boolean = false

  public toggleAutoLoad() {
    this.autoLoad = !this.autoLoad
  }

  private onModelsChanged(table: TableComponent) {
    if (this.$refs.table) {
      const api = (this.$refs.table as any).gridApi
      if (api) {
        this.wasSorted =
          !_.isEmpty(api.getFilterModel()) || !_.isEmpty(api.getSortModel())
      }
    }
  }

  private resetTable(table: TableComponent) {
    if (this.$refs.table) {
      const api = (this.$refs.table as any).gridApi
      if (api) {
        api.setFilterModel(null)
        api.setSortModel(null)
      }
    }
  }

  private async saveCSV() {
    const id = Number(this.$route.params.id)
    const csv = await this.tableToCSV(id)
    const table = this.hierarchyElem(id) as Table
    saveAs(
      new Blob([csv], { type: 'text/plain;charset=utf-8' }),
      `${table.tableName}.csv`
    )
  }
}
