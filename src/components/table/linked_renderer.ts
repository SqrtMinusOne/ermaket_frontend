import { Component, Vue, Mixins } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn, TableLinkType, Table } from '@/types/user'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'
import TableEditMixin from '@/mixins/table_edit'

interface Params extends ICellRendererParams {
  [key: string]: any
}

const Mappers = Mixins(TableEditMixin).extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord', 'isTransactee']),
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
    <div v-else v-b-popover.hover="recordTooltip">
      <b-button
        variant="outline-primary"
        @click="onLinkedTable"
        v-b-tooltip.hover.noninteractive
        title="Open linked table"
        class="mr-1"
        v-if="!isLinkOpened && showLinkedToggle"
        :disabled="!canOpenLinked"
      >
        <font-awesome-icon :icon="['fas', 'arrow-down']"/>
      </b-button>
      <b-button v-else-if="showLinkedToggle"
        variant="outline-primary"
        @click="onCloseLinkedTable"
        v-b-tooltip.hover.noninteractive
        title="Close linked table"
        class="mr-1"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up']"/>
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
  private canEditRecord!: any

  private created() {
    this.linked = this.getTable(
      this.colElem.linkSchema,
      this.colElem.linkTableName
    ) as Table
    if (this.params.context.parent.autoLoadLinked && !this.record) {
      this.onSync()
    }
  }

  private get canOpenLinked() {
    // TODO dropdown toggle in settings
    return this.canEditRecord(this.key, this.params)
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
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

  private onCloseLinkedTable() {
    this.params.context.parent.onLinkedClose(
      this.params.data[this.params.pk.rowName]
    )
  }

  private get colElem(): LinkedColumn {
    return this.params.columnElem
  }

  private get showLinkedToggle() {
    return (
      this.colElem.linkType === TableLinkType.combined ||
      this.colElem.linkType === TableLinkType.linked
    )
  }

  private get isLinkOpened() {
    return (
      this.colElem ===
      this.params.context.parent.getLinked(
        this.params.data[this.params.pk.rowName]
      )
    )
  }

  private get record() {
    return this.getRecord(
      this.params.table.id,
      this.params.data[this.params.pk.rowName]
    )
  }

  private get displayData() {
    let data = this.record?.data[this.colElem.rowName]
    if (this.record?.data._display[this.colElem.rowName]) {
      if (!this.isTransactee(this.params.table.id, this.key)) {
        data = this.record.data._display[this.colElem.rowName]
      } else {
        data = '[Changed]'
      }
    }
    return data
  }

  private get recordString() {
    if (this.record) {
      const data = this.displayData
      if (!Array.isArray(data)) {
        return data
      }
      return data.join(', ')
    }
    return ''
  }

  private get recordTooltip() {
    let content = ''
    if (this.record) {
      const data = this.displayData

      if (data === '[Changed]') {
        return 'Data preview is available only for unchanged records'
      }

      if (!Array.isArray(data)) {
        return data
      }
      content = `<ul class="list_no_indent">${data
        .map((datum) => `<li>${datum}</li>`)
        .join('')}</ul>`
    }
    return {
      title: this.colElem.text,
      content,
      html: true,
    }
  }

  private get isFk(): boolean {
    return Boolean(this.colElem.fkName)
  }
}
