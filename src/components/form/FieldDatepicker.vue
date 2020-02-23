<template>
  <date-picker
    v-model="value"
    :config="options"
    :readonly="schema.readonly"
    :disabled="disabled"
  />
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
// tslint:disable-next-line:no-var-requires
const abstractField = require('vue-form-generator').abstractField
import moment from 'moment'

export default class FieldDatepicker extends Mixins(abstractField) {
  private val?: Date
  private value!: any
  private schema!: any

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

  private created() {
    this.val = this.value.toDate()
    this.options.format = this.schema.dateFormat
  }

  @Watch('val')
  private onValChanged() {
    this.value = moment(this.value, this.options.format)
  }
}
</script>

<style scoped></style>
