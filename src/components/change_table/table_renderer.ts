import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { userMapper } from '@/store/modules/user'
import { Table } from '@/types/user'

import { TransactionType } from '@/types/tables'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  }
})

@Component({
  template: `
  <div>
    <b-link :to="link" v-b-tooltip.hover.noninteractive title="Go to table">
      {{ table.name }}
    </b-link>
  </div>
  `
})
export default class TableRenderer extends Mappers {
  private params!: ICellRendererParams

  private get table() {
    return this.hierarchyElem(this.params.data.id) as Table
  }

  private get link() {
    return `/table/${this.table.id}`
  }
}
