import { ICellEditorParams } from 'ag-grid-community'
import { Component, Vue } from 'vue-property-decorator'

interface Params extends ICellEditorParams {
  [key: string]: any
}

@Component({
  template: `
    <b-form-input v-if="number" :type="type"  v-model="value" ref="input" autofocus />
    <b-form-input v-else :type="type" :step="step" v-model="value" ref="input" autofocus number />
  `
})
export default class BootstrapEditor extends Vue {
  private params!: Params
  private value: any
  private number: boolean = false
  private step: number = 1
  private type: string = 'text'
  
  public getValue() {
    return this.value
  }

  private created() {
    this.setType()
    this.value = this.params.value
  }

  private setType() {
    switch (this.params.columnElem.type) {
      case 'float8':
      case 'float4':
        this.type = 'number'
        this.step = 0.01
        this.number = true
        break
      case 'int8':
      case 'int4':
      case 'int2':
        this.type = 'number'
        this.number = true
        break
      case 'date':
        this.type = 'date'
        break
      case 'time':
        this.type = 'time'
        break
      default:
        if (this.params.columnElem.type.startsWith('decimal')) {
          this.type = 'number'
          this.number = true
        }
    }
  }
}
