import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { Column } from '@/types/user'

interface Params extends ICellRendererParams {
  [key: string]: any
}

@Component({
  template: `
    <b-spinner v-b-tooltip.hover.noninteractive title="Загрузка" v-if="!params.data" />
    <div v-else> {{ params.value }} </div>
  `
})
export default class GeneralRenderer extends Vue {
  private params!: Params
}
