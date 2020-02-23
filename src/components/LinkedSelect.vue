<template>
  <div class="d-flex">
    <b-spinner
      v-b-tooltip.hover.noninteractive
      title="Загрузка вариантов из связанной таблицы"
      v-if="isLoading"
    />
    <b-form-select
      v-else-if="loaded"
      :value="value"
      @change="onChange"
      :multiple="multiple"
      :options="options"
    />
    <b-button
      v-else
      variant="outline-primary"
      @click="load"
      v-b-tooltip.hover.noninteractive
      title="Load the data from the linked table"
      block
    >
      <font-awesome-icon :icon="['fas', 'sync']" />
      Load the data
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'
import { ValueSetterParams } from 'ag-grid-community'
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
  @Prop({ type: Boolean, default: false }) private readonly multiple!: boolean
  @Prop({ type: Boolean, default: false }) private readonly autoload!: boolean
  @Model('change') private value: any

  private isLoading: boolean = false
  private loaded: boolean = false
  private index!: string
  private data: any[] = []
  private options: any[] = []
  private tableElem!: Table

  private created() {
    this.tableElem = this.getTable(this.schema, this.table) as Table
    this.index = (this.tableElem.columns.find(
      (column) => column.isPk
    ) as Column).rowName
    if (this.autoload) {
      this.load()
    }
  }

  private async load() {
    this.isLoading = true
    this.data = await this.fetchRows({
      id: this.tableElem.id,
      rowStart: -1,
      rowEnd: 0,
    })
    this.options = this.data.map((datum) => datum[this.index])
    this.isLoading = false
    this.loaded = true
  }

  private onChange(event: any) {
    this.$emit('change', event)
  }
}
</script>
