import TableComponent from '@/components/Table.vue'
import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn, Table, TableLinkType } from '@/types/user'
import { LoadedRecord } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

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
    <b-card
      border-variant="primary"
      header-bg-variant="primary"
      header-text-variant="white"
      no-body
    >
      <template v-slot:header>
        <b>{{ table.name }}</b>
      </template>
      <TableComponent
        :id="table.id"
        style="height: 300px"
        :keys="record.data[this.column.rowName]"
        :keysParams="keysParams"
        @change="onKeysChange"
      />
    </b-card>
  `,
})
export default class LinkedTableRenderer extends Mappers {
  private params!: Params
  private record!: LoadedRecord
  private edit: boolean = true

  private created() {
    this.record = this.getRecord(this.params.table.id, this.key) as LoadedRecord
  }

  private onKeysChange(event: any) {
    console.log(event)
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
  }

  private get keysParams() {
    return {
      edit: this.edit,
      column: this.column
    }
  }

  private get column(): LinkedColumn {
    return this.params.data._linked
  }

  private get table() {
    return this.getTable(this.column.linkSchema, this.column.linkTableName)
  }
}
