import { ICellEditorParams } from 'ag-grid-community'
import { Component, Vue } from 'vue-property-decorator'
import { LinkedColumn, TableLinkType, Column } from '@/types/user'
import LinkedSelect from '@/components/LinkedSelect.vue'

interface Params extends ICellEditorParams {
  [key: string]: any
}

@Component({
  template: `
  <LinkedSelect
    :table="column.linkTableName"
    :schema="column.linkSchema"
    :multiple="column.isMultiple"
    v-model="value"
  />`,
  components: {
    LinkedSelect,
  }
})
export default class LinkedEditor extends Vue {
  private params!: Params
  private value: any

  public getValue() {
    return this.value
  }

  public isPopup() {
    return this.column.isMultiple
  }

  private created() {
    this.value = this.params.data[this.column.fkName as keyof Params]
  }

  private get column(): LinkedColumn {
    return this.params.columnElem
  }

  private get isSimple() {
    return this.column.linkType === TableLinkType.simple
  }
}
