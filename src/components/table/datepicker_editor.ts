import { ICellEditorParams } from 'ag-grid-community'
import { Component, Vue, Mixins } from 'vue-property-decorator'
import TableEditMixin from '@/mixins/table_edit'
import moment from 'moment'

interface Params extends ICellEditorParams {
  [key: string]: any
}

@Component({
  template: `
    <date-picker v-model="value" :config="options" />
  `,
})
export default class DatePickerEditor extends Mixins(TableEditMixin) {
  private params!: Params
  private value?: Date
  private options: any = {
    icons: {
      time: 'fas fa-clock',
      date: 'fas fa-calendar',
      clear: 'fas fa-trash-alt',
      close: 'fas fa-times-circle'
    },
    sideBySide: true,
    showTodayButton: true,
    showClose: true
  }

  public getValue() {
    return moment(this.value, this.options.format)
  }

  public isCancelBeforeStart() {
    return !this.canEditRecord(this.key, this.params)
  }

  public isPopup() {
    return true
  }

  public created() {
    this.value = this.params.value.toDate()
    if (this.params.columnElem.dateFormat) {
      this.options.format = this.params.columnElem.dateFormat
    }
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
  }
}
