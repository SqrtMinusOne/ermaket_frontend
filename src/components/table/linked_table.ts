import MainCard from '@/components/ui/MainCard.vue'
import TableComponent from '@/components/Table.vue'
import TableControls from '@/mixins/table_controls'
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import { ICellRendererParams, GridApi } from 'ag-grid-community'
import { LinkedColumn, Table, TableLinkType } from '@/types/user'
import { LoadedRecord } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

const Mappers = Mixins(TableControls).extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord', 'setRecordUpdate']),
  },
})

@Component({
  template: `
    <main-card :name="table.name" no-body>
      <template v-slot:controls>
        <b-button @click="toggleEdit" variant="outline-light" size="sm">
          <font-awesome-icon :icon="['fas', 'pencil-alt']" v-if="edit" />
          <font-awesome-icon :icon="['fas', 'eye']" v-else />
          {{ !edit ? 'View mode' : 'Edit mode' }}
        </b-button>
        <b-button
          @click="resetTable"
          variant="outline-light"
          size="sm"
          v-b-tooltip.hover.noninteractive
          title="Reset filters and sorting"
          v-if="wasSorted">
          <font-awesome-icon :icon="['fas', 'table']" />
        </b-button>
        <b-button
          @click="toggleAutoLoad"
          variant="outline-light"
          size="sm"
          v-b-tooltip.hover.noninteractive
          title="Toggle autoload of linked records"
          >
          <font-awesome-icon :icon="['fas', 'magnet']" v-if="autoLoad" />
          <font-awesome-icon :icon="['fas', 'mouse']" v-else />
          {{ autoLoad ? 'Auto' : 'Manual' }}
        </b-button>
        <b-button
          v-b-tooltip.hover.noninteractive title="Close linked table"
          @click="onClose"
          variant="outline-light"
          size="sm"
          >
          <font-awesome-icon :icon="['fas', 'times']" />
        </b-button>
      </template>
      <TableComponent
        :id="table.id"
        style="height: 300px"
        v-model="keys"
        :keysParams="keysParams"
        :autoLoad="autoLoad"
        @modelsChanged="onModelsChanged"
        ref="table"
      />
    </main-card>
  `,
  components: { MainCard }
})
export default class LinkedTableRenderer extends Mappers {
  // TODO Turn off key editing in linked tables
  private params!: Params
  private record: LoadedRecord = null as unknown as LoadedRecord
  private edit: boolean = false
  private keys: any[] | any | null = null

  private created() {
    this.record = this.getRecord(this.params.table.id, this.key) as LoadedRecord
    this.keys = this.record.data[this.column.rowName]
  }

  @Watch('keys')
  private onKeysChange(event: any[] | any, oldKeys: any[] | any | null) {
    if (oldKeys === null) {
      return
    }
    const data: any = {}
    data[this.params.pk.rowName] = this.key
    data[this.column.rowName] = event
    this.keys = event
    this.setRecordUpdate({
      id: this.params.table.id,
      key: this.key,
      data,
      index: this.index,
    })
    const api = this.params.context.parent.gridOptions.api as GridApi
    const node = api.getDisplayedRowAtIndex(this.params.node.rowIndex - 1)
    api.redrawRows({
      rowNodes: [node]
    })
  }

  private onClose() {
    this.params.context.parent.onLinkedClose(this.key)
  }

  private toggleEdit() {
    this.edit = !this.edit
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
  }

  private get index() {
    return this.params.data._index
  }

  private get keysParams() {
    return {
      edit: this.edit,
      column: this.column,
    }
  }

  private get column(): LinkedColumn {
    return this.params.data._linked
  }

  private get table() {
    return this.getTable(this.column.linkSchema, this.column.linkTableName)
  }
}
