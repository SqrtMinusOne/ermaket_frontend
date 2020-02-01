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
  template: `<b>hello</b>`
})
export default class LinkedTableRenderer extends Mappers {
  private params!: Params
}
