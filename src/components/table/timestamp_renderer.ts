import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { Column } from '@/types/user'
import moment from 'moment'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `
    <div> {{ text }} </div>
  `
})
export default class DateRenderer extends Vue {
  private params!: Params

  private get text() {
    const m = moment(this.params.value)
    if (this.colElem.dateFormat) {
      return m.format(this.colElem.dateFormat)
    } else {
      return m.format()
    }
  }

  private get colElem(): Column {
    return this.params.columnElem
  }
}
