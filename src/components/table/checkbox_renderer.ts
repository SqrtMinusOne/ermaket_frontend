import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { Column } from '@/types/user'
import moment from 'moment'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `
    <b-form-checkbox :checked="this.params.value" @change="onChange" inline />
  `
})
export default class CheckboxRenderer extends Vue {
  private params!: Params

  private get colElem(): Column {
    return this.params.columnElem
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
  }

  private onChange(event: boolean) {
    console.log(event)
  }
}
