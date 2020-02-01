import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn, TableLinkType, Table } from '@/types/user'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'
import TableComponent from '@/components/Table.vue'

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
    <div>
      <TableComponent
        :id="table.id"
        style="height: 200px" />
    </div>
  `,
})
export default class LinkedTableRenderer extends Mappers {
  private params!: Params

  private get column(): LinkedColumn {
    return this.params.data._linked
  }

  private get table() {
    return this.getTable(this.column.linkSchema, this.column.linkTableName)
  }
}
