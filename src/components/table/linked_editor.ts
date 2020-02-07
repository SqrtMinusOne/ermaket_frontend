import { ICellEditorParams, ValueSetterParams } from 'ag-grid-community'
import { Component, Vue } from 'vue-property-decorator'
import { LinkedColumn, TableLinkType, Column } from '@/types/user'
import { LoadedRecord } from '@/types/tables'
import LinkedSelect from '@/components/LinkedSelect.vue'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'

interface Params extends ICellEditorParams {
  [key: string]: any
}

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord']),
  },
})

export function MakeLinkedSelectSetter(
  column: LinkedColumn,
  setRecord: (key: any, data: any, index?: number) => void,
  pk: Column,
): ((params: ValueSetterParams) => boolean) | string | undefined {
  if (column.fkName) {
    return (params: ValueSetterParams) => {
      params.data[column.fkName as keyof any] = params.newValue
      return true
    }
  } else {
    return (params: ValueSetterParams) => {
      const data: any = {}
      const key = params.data[pk.rowName]
      const index = params.data._index
      data[column.rowName] = params.newValue
      data[pk.rowName] = key // 100% pk won't change here
      setRecord(key, data, index)
      return true
    }
  }
}

@Component({
  template: `
  <LinkedSelect
    :table="column.linkTableName"
    :schema="column.linkSchema"
    :multiple="column.isMultiple"
    v-model="value"
    v-if="!isCancelBeforeStart()"
  />`,
  components: {
    LinkedSelect,
  },
})
export default class LinkedEditor extends Mappers {
  private params!: Params
  private value: any = null

  public getValue() {
    return this.value
  }

  public isPopup() {
    return this.column.isMultiple
  }

  public isCancelBeforeStart() {
    return !this.column.fkName && !this.record
  }

  private created() {
    if (this.column.fkName) {
      this.value = this.params.data[this.column.fkName as keyof Params]
    } else {
      const rec = this.record
      if (rec) {
        this.value = rec.data[this.column.rowName]
      }
    }
  }

  private get column(): LinkedColumn {
    return this.params.columnElem
  }

  private get record() {
    return this.getRecord(
      this.params.table.id,
      this.params.data[this.params.pk.rowName]
    )
  }

  private get isSimple() {
    return this.column.linkType === TableLinkType.simple
  }
}
