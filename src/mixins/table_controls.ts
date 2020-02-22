import { Component, Mixins, Vue } from 'vue-property-decorator'
import TableComponent from '@/components/Table.vue'
import _ from 'lodash'

@Component
export default class TableControls extends Vue {
  public wasSorted: boolean = false
  public autoLoad: boolean = false

  public toggleAutoLoad() {
    this.autoLoad = !this.autoLoad
  }

  private onModelsChanged(table: TableComponent) {
    if (this.$refs.table) {
      const api = (this.$refs.table as any).gridApi
      if (api) {
        this.wasSorted = !_.isEmpty(api.getFilterModel()) || !_.isEmpty(api.getSortModel())
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
}
