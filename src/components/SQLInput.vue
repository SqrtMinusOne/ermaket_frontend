<template>
  <codemirror :value="code" @input="onInput" :options="cmOptions" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'

import 'codemirror/addon/hint/show-hint.css'

import 'codemirror/mode/sql/sql.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/sql-hint.js'

@Component
export default class SQLInput extends Vue {
  private cmOptions = {
    autoCloseBrackets: true,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    indentUnit: 4,
    line: true,
    lineNumbers: true,
    mode: 'text/x-pgsql',
    styleActiveLine: true,
  }

  @Model('change', { type: String, required: true }) private readonly code!: string

  private onInput(event: string) {
    this.$emit('change', event)
  }
}
</script>
