<template>
  <div>
    <main-card name="SQL Console" class="mb-2">
      <template v-slot:controls>
        <div class="ml-2" v-b-tooltip.noninteractive title="Send request">
          <b-button
            variant="outline-light"
            size="sm"
            @click="onSend"
            :disabled="isSending"
          >
            <font-awesome-icon :icon="['fas', 'save']" />
            Commit
          </b-button>
        </div>
        <rights-breakdown
          size="sm"
          variant="outline-light"
          :id="Number($route.params.id)"
        />
      </template>
      <SQLInput v-model="code" />
    </main-card>
    <main-card name="Result" no-body>
      <div v-if="response" class="p-3">
        <ResultTable :keys="response.keys" :rows="response.result" />
      </div>
      <b-alert
        v-model="showError"
        dismissible
        variant="danger"
        @dismissed="showError = false"
      >
        <ErrorShow :response="errorData" />
      </b-alert>
    </main-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import SqlAPI, { SQLResponse } from '@/api/sql'
import { DefaultResponse } from '@/types/user'

import ErrorShow from '@/components/ErrorShow.vue'
import MainCard from '@/components/ui/MainCard.vue'
import ResultTable from '@/components/ResultTable.vue'
import RightsBreakdown from '@/components/ui/RightsBreakdown.vue'
import SQLInput from '@/components/SQLInput.vue'

const Mappers = Vue.extend({})

@Component({
  components: { ErrorShow, MainCard, ResultTable, RightsBreakdown, SQLInput },
})
export default class SQLConsole extends Mappers {
  private code: string = 'SELECT * FROM er1.task;'
  private response: SQLResponse | null = null
  private errorData: any = null
  private showError: boolean = false
  private isSending: boolean = false

  private async onSend() {
    this.isSending = true
    this.showError = false
    this.response = null
    this.errorData = null

    try {
      const response = await SqlAPI.sendRequest(this.code)
      this.response = response.data
    } catch (err) {
      this.showError = true
      this.errorData = err.response.data
    }
    this.isSending = false
  }
}
</script>

<style scoped></style>
