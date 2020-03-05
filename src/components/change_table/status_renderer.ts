import { Component, Vue, Mixins } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { ErrorSeverity, ValidationError } from '@/types/tables'
import TableErrors from '@/mixins/table_errors'
import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `<div v-if="_.isEmpty(params.data.errors)">
    <font-awesome-icon :icon="['fas', 'check']" />
  </div>
  <div v-else>
    <font-awesome-icon v-if="isError"
      :icon="['fas', 'exclamation-triangle']"
      v-b-popover.hover.noninteractive="errorPopover"
    />
    <font-awesome-icon v-else
      :icon="['fas', 'info']"
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

  private get isError() {
    return this.params.data.errors.some((err: ValidationError) => err.severity = ErrorSeverity.error)
  }
}
