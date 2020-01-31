import { ICellEditorParams } from 'ag-grid-community'
import { Component, Vue } from 'vue-property-decorator'
import { LinkedColumn, TableLinkType } from '@/types/user'

interface Params extends ICellEditorParams {
  [key: string]: any
}

@Component({
  template: `<b-form-input />`
})
export default class LinkedEditor extends Vue {
  private params!: Params
  private value: any

  public getValue() {
    return this.value
  }

  private get column(): LinkedColumn {
    return this.params.columnElem
  }

  private get isSimple() {
    return this.column.linkType === TableLinkType.simple
  }
}
