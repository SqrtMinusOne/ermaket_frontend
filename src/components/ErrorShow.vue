<template>
  <div v-if="response">
    <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
    <b>{{ text }}</b>
    <div v-if="hasDetails">Details:</div>
    <ul v-if="isValidationInfo">
      <li v-for="(value, key) in response.data" :key="key">
        <b>{{ key }}</b>: {{ value.join(', ') }}
      </li>
    </ul>
    <div v-else-if="response.data">
     <pre> {{ responseData }} </pre>
    </div>
    <div v-if="response.traceback">
      <pre> {{ response.traceback }} </pre>
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
import _ from 'lodash'

@Component({
  name: 'ErrorShow'
})
export default class ErrorShow extends Vue {
  @Prop({ type: Object, required: true }) private readonly response!: TableErrorResponse

  private get isValidationInfo() {
    return !_.isNil(this.response.data) && instanceOfValidationInfo(this.response.data)
  }

  private get text() {
    if (this.isValidationInfo) {
      return 'Validation Error'
    }
    return this.response.message
  }

  private get hasDetails() {
    return !_.isNil(this.response.data) || !_.isNil(this.response.traceback)
  }

  private get responseData() {
    if (_.isObject(this.response.data)) {
      return JSON.stringify(this.response.data, null, 4)
    }
  }
}
</script>

<style scoped></style>
