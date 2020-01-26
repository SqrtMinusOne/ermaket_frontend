import { Component, Vue, Watch } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn } from '@/types/user'

@Component({
  template: `
    <div v-if="isFk"> {{ params.data[colElem.fkName] }} </div>
  `
})
export default class LinkedRenderer extends Vue {
  private params!: ICellRendererParams
  
  private mounted() {}

  private get colElem(): LinkedColumn {
    return this.params.colDef.cellRendererParams.columnElem
  }

  private get isFk(): boolean {
    return Boolean(this.colElem.fkName)
  }
}
