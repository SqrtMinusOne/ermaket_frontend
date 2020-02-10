import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'

import { TransactionType } from '@/types/tables'

@Component({
  template: `
  <div v-if="isCreated">
    New record
  </div>
  <div v-else-if="isUpdated">
    <i>Updated</i>
  </div>
  <div v-else-if="isDeleted">
    <b>Deleted</b>
  </div>
  `
})
export default class TransactionTypeRenderer extends Vue {
  private params!: ICellRendererParams

  private get isCreated() {
    return this.params.value === TransactionType.create
  }

  private get isUpdated() {
    return this.params.value === TransactionType.update
  }

  private get isDeleted() {
    return this.params.value === TransactionType.delete
  }
}
