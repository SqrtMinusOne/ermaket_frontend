<template>
  <LinkedSelect
    :table="schema.table"
    :schema="schema.schema"
    :multiple="schema.multiple"
    v-model="value"
    class="w-100"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import LinkedSelect from '@/components/LinkedSelect.vue'
// tslint:disable-next-line:no-var-requires
const abstractField = require('vue-form-generator').abstractField

@Component({
  components: { LinkedSelect },
})
export default class FieldLinkedSelect extends Mixins(abstractField) {}
</script>

<style scoped></style>
