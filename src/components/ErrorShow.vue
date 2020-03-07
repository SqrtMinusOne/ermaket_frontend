<template>
  <div v-if="response">
    <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
    <b>{{ text }}</b>
    <div>Details:</div>
    <ul v-if="isValidationInfo">
      <li v-for="(value, key) in response.data.info" :key="key">
        <b>{{ key }}</b>: {{ value.join(', ') }}
      </li>
    </ul>
    <div v-else>
      {{ response.data.info }}
    </div>
  </div>
  <div v-else>
    No error
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { TableErrorResponse } from '@/types/tables'
import {
  instanceOfValidationInfo,
  instanceOfDefaultInfo,
} from '@/types/table_guards'

@Component
export default class ErrorShow extends Vue {
  @Prop({ type: Object, required: true }) private readonly response!: TableErrorResponse

  private get isValidationInfo() {
    return instanceOfValidationInfo(this.response.data.info)
  }

  private get text() {
    if (this.isValidationInfo) {
      return 'Validation Error'
    }
    return 'Unknown error'
  }
}
</script>

<style scoped></style>
