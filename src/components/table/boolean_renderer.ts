import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { Column, Table, Access } from '@/types/user'
import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `
  <div class="d-flex align-items-center h-100">
    <b-form-checkbox
    :disabled='!isEditable'
    :checked="params.value"
    style="height: 10px"
    @change="onChange"
    switch />
  </div>
  `
})
export default class BooleanRenderer extends Vue {
  private params!: Params

  private onChange(newValue: boolean) {
    this.params.setValue(newValue)
  }

  private get columnElem() {
    return this.params.columnElem as Column | undefined
  }

  private get table() {
    return this.params.table as Table
  }

  private get isEditable() {
    if (this.table.userAccess.has(Access.change)) {
      return this.columnElem ? this.columnElem.isEditable : true
    }
    return false
  }
}
