<template>
  <date-picker
    v-model="val"
    @dp-change="onValChanged"
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

@Component
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
    if (this.value) {
      try {
        this.val = this.value.toDate()
      } catch (TypeError) {
        this.val = moment(this.value).toDate()
      }
    } else if (this.schema.default) {
      this.val = this.schema.default.toDate()
    } else {
      this.val = undefined
    }
    this.options.format = this.schema.dateFormat
  }

  private onValChanged(e: any) {
    this.value = e.date
  }
}
</script>

<style scoped></style>
