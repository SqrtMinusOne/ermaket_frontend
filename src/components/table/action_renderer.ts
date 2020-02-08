import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import { Column, Access, Table } from '@/types/user'

interface Params extends ICellRendererParams {
  [key: string]: any
}


const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['isTransactee', 'isToDelete'])
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord', 'setDelete', 'revert']),
  },
})

@Component({
  template: `<span>
    <b-button v-if="canRevert"
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Revert changes"
      @click="onRevert"
    >
      <font-awesome-icon :icon="['fas', 'history']" />
    </b-button>
    <b-button v-if="canDelete"
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Mark the entry for deletion"
      @click="onDelete"
    >
      <font-awesome-icon :icon="['fas', 'times']" />
    </b-button>
  </span>`
})
export default class ActionRenderer extends Mappers {
  private params!: Params
  
  private onDelete() {
    this.setDelete({ id: this.table.id, key: this.key })
    this.params.api.redrawRows({ rowNodes: [this.params.node] })
  }

  private async onRevert() {
    const { row } = await this.revert({ id: this.table.id, key: this.key, index: this.params.data._index }) as any
    if (row) {
      this.params.node.setData({
        ...this.params.data,
        ...row
      })
    }
    this.params.api.redrawRows({ rowNodes: [this.params.node] })
  }

  private get table() {
    return this.params.table as Table
  }

  private get canDelete() {
    return !this.params.noDelete && this.table.userAccess.has(Access.delete) && !this.isToDelete(this.table.id, this.key)
  }

  private get canRevert() {
    return !this.params.noRevert && this.isTransactee(this.table.id, this.key)
  }

  private get key() {
    return this.params.data[this.pk.rowName]
  }

  private get pk() {
    return this.params.pk as Column
  }
}
