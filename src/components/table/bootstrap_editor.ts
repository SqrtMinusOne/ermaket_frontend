import { ICellEditorParams } from 'ag-grid-community'
import { Component, Vue } from 'vue-property-decorator'
import { Column, TableLinkType, Table, LinkedColumn } from '@/types/user'
import { instanceOfLinkedColumn } from '@/types/user_guards'
import { userMapper } from '@/store/modules/user'

interface Params extends ICellEditorParams {
  [key: string]: any
}

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
  },
})

@Component({
  template: `
    <b-form-input v-if="number" :type="type"  v-model="value" ref="input" autofocus number />
    <b-form-input v-else :type="type" :step="step" v-model="value" ref="input" autofocus />
  `,
})
export default class BootstrapEditor extends Mappers {
  private params!: Params
  private value: any
  private number: boolean = false
  private step: number = 1
  private type: string = 'text'

  public getValue() {
    return this.value
  }
  
  public isCancelBeforeStart() {
    return !this.params.data
  }

  private get column(): Column {
    return this.params.columnElem
  }

  private created() {
    this.setType()
    if (!instanceOfLinkedColumn(this.column)) {
      this.value = this.params.value
    } else {
      this.value = this.params.data[this.column.fkName as keyof Params]
    }
  }

  private setType() {
    const toSwitch = this.column.type
    switch (toSwitch) {
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
        if (toSwitch && toSwitch.startsWith('decimal')) {
          this.type = 'number'
          this.number = true
        }
    }
  }
}
