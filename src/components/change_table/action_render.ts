import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import { Column, Access, Table } from '@/types/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['revert']),
  },
})

@Component({
  template: `<span>
    <b-button
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Revert changes"
      @click="onRevert"
    >
      <font-awesome-icon :icon="['fas', 'history']" />
    </b-button>
  </span>`
})
export default class ActionRenderer extends Mappers {
  private params!: ICellRendererParams

  private async onRevert() {
    const { row } = await this.revert({ id: this.table.id, key: this.key }) as any
    // this.params.api.({ rowNodes: [this.params.node] })
    // this.params.context.parent.onUpdate()
  }

  private get table() {
    return this.hierarchyElem(this.params.data.id)!
  }

  private get key() {
    return this.params.data.key
  }
}
