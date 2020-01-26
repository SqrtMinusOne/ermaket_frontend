import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn } from '@/types/user'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `
    <div v-if="isFk"> {{ params.data[colElem.fkName] }} </div>
  `
})
export default class LinkedRenderer extends Vue {
  private params!: Params
  
  private get colElem(): LinkedColumn {
    return this.params.columnElem
  }

  private get isFk(): boolean {
    return Boolean(this.colElem.fkName)
  }
}
