import { Component, Vue } from 'vue-property-decorator'
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community'
import { Column } from '@/types/user'
import _ from 'lodash'

interface Params extends IFilterParams {
  [key: string]: any
}

@Component({
  template: `
    <b-form-checkbox-group
      :options="columnElem.enumOptions"
      v-model="selected"
      stacked
      @change="onChecked"
    />
  `,
})
export default class SetFilter extends Vue {
  private params!: Params
  private columnElem!: Column

  private selected?: string[] = []

  public isFilterActive() {
    return !_.isEmpty(this.selected)
  }

  public doesFilterPass(params: IDoesFilterPassParams) {
    return true // TODO
  }

  public getModel() {
    console.log(this.selected)
    if (!_.isEmpty(this.selected)) {
      return {
        type: 'enum',
        filter: this.selected
      }
    }
    return null
  }

  public setModel(model?: string[]) {
    this.selected = model
  }

  private created() {
    this.columnElem = this.params.columnElem
  }

  private onChecked() {
    this.$nextTick(() => {
      this.params.filterChangedCallback()
    })
  }
}
