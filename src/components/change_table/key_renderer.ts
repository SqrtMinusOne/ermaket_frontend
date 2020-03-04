import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { TransactionType } from '@/types/tables'
import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `<div v-if="isNew">
      <font-awesome-icon :icon="['fas', 'plus']" /> New
  </div>
  <div v-else>
    {{ params.value }}
  </div>
  `
})
export default class KeyRenderer extends Vue {
  private params!: Params

  private get isNew() {
    return this.params.data.type === TransactionType.create && this.params.data.isAuto
  }
}
