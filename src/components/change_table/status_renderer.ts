import { Component, Vue, Mixins } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import TableErrors from '@/mixins/table_errors'
import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `<div v-if="_.isEmpty(params.data.errors)">
    <font-awesome-icon :icon="['fas', 'check']" >
  </div>
  <div v-else>
    <font-awesome-icon
      :icon="['fas', 'exclamation-triangle']"
      v-b-popover.hover.noninteractive="errorPopover"
    />
  </div>
  `
})
export default class StatusRenderer extends Mixins(TableErrors) {
  private params!: Params
  private get errorPopover() {
    return this.getErrorsPopover(this.params.data.errors)
  }
}
