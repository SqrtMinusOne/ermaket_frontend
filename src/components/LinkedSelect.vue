<template>
  <div class="d-flex">
    <b-spinner
      v-b-tooltip.hover
      title="Загрузка вариантов из связанной таблицы"
      v-if="isLoading"
    />
    <b-form-select
      :value="value"
      @change="$emit('change', $event.target.value)"
      :multiple="multiple"
      :options="options"
      :key="key"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'
import { Table, Column } from '@/types/user'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRows']),
  },
})

@Component({})
export default class LinkedSelect extends Mappers {
  @Prop({ type: String, required: true }) private readonly table!: string
  @Prop({ type: String, required: true }) private readonly schema!: string
  @Prop({ type: Boolean, default: false }) private readonly multiple: boolean = false
  @Model('change') private value: any

  private isLoading: boolean = true
  private index!: string 
  private data: any[] = []
  private options: any[] = []
  private tableElem!: Table
  private key: number = 0

  private async created() {
    this.tableElem = this.getTable(this.schema, this.table) as Table
    this.index = (this.tableElem.columns.find(
      (column) => column.isPk
    ) as Column).rowName

    this.data = await this.fetchRows({
      id: this.tableElem.id,
      rowStart: -1,
      rowEnd: 0,
    })

    this.options = this.data.map((datum) => datum[this.index])
    this.isLoading = false
    this.key++
  }
}
</script>
