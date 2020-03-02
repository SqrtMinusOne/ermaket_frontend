import { Component, Mixins, Vue } from 'vue-property-decorator'
import { ICellEditorParams } from 'ag-grid-community'
import { Access } from '@/types/user'
import { tableMapper } from '@/store/modules/table'
import _ from 'lodash'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['isToDelete'])
  }
})

@Component
export default class TableEditMixin extends Mappers {
  public canEditRecord(key: any, params: any) {
    const id = params.table.id
    return !_.isNil(params.data) && !this.isToDelete(id, key)
  }
}
