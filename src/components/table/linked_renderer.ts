import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn, TableLinkType, Table } from '@/types/user'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'

interface Params extends ICellRendererParams {
  [key: string]: any
}

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord']),
  },
})

@Component({
  template: `
    <b-spinner
      v-b-tooltip.hover.noninteractive
      title="Loading from linked tables"
      v-if="isLoading || !params.data"
    />
    </div>
    <div v-else-if="isFk"> {{ params.data[colElem.fkName] }} </div>
    <div v-else-if="!record">
      <b-button
        variant="outline-primary"
        @click="onSync"
        v-b-tooltip.hover.noninteractive
        title="Load the record from linked tables"
      >
        <font-awesome-icon :icon="['fas', 'sync']"/>
      </b-button>
    </div>
    <div v-else v-b-tooltip.hover.bottomright.html="recordTooltip">
      <b-button
        variant="outline-primary"
        @click="onLinkedTable"
        v-b-tooltip.hover.noninteractive
        title="Open linked table"
        class="mr-1"
      >
        <font-awesome-icon :icon="['fas', 'arrow-down']"/>
      </b-button>
      {{ recordString }}
    </div>
  `,
})
export default class LinkedRenderer extends Mappers {
  private params!: Params
  private value!: any
  private linked!: Table
  private isLoading: boolean = false

  private created() {
    this.linked = this.getTable(
      this.colElem.linkSchema,
      this.colElem.linkTableName
    ) as Table
  }

  private async onSync() {
    this.isLoading = true
    await this.fetchRecord({
      id: this.params.table.id as number,
      key: this.params.data[this.params.pk.rowName],
    })
    this.isLoading = false
    this.params.api.refreshCells({ rowNodes: [this.params.node], force: true })
  }

  private onLinkedTable() {
    this.params.context.parent.onLinkedTable(
      this.params.data[this.params.pk.rowName],
      this.colElem
    )
  }

  private get colElem(): LinkedColumn {
    return this.params.columnElem
  }

  private get record() {
    return this.getRecord(
      this.params.table.id,
      this.params.data[this.params.pk.rowName]
    )
  }

  private get recordString() {
    if (this.record) {
      const data = this.record.data[this.colElem.rowName]
      if (!Array.isArray(data)) {
        return data
      }
      return data.join(', ')
    }
    return ''
  }

  private get recordTooltip() {
    if (this.record) {
      const data = this.record.data[this.colElem.rowName]
      if (!Array.isArray(data)) {
        return data
      }
      return `<ul class="list_no_indent">${data
        .map((datum) => `<li>${datum}</li>`)
        .join('')}</ul>`
    }
    return ''
  }

  private get isFk(): boolean {
    return Boolean(this.colElem.fkName)
  }
}
