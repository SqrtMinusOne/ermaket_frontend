<template>
  <div>
    <main-card name="SQL Console">
      <template v-slot:controls>
        <div class="ml-2" v-b-tooltip.noninteractive title="Send request">
          <b-button
            variant="outline-light"
            size="sm"
            @click="onSend"
            :disabled="isSending"
            class="mr-2"
          >
            <font-awesome-icon :icon="['fas', 'save']" />
            Send
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
    <main-card
      v-for="(result, index) in results"
      :name="result.name"
      :key="result.name"
      class="mt-2"
      no-body
    >
      <template v-slot:controls>
        <b-button
          class="mr-2"
          variant="outline-light"
          size="sm"
          v-b-tooltip.noninteractive
          title="Copy code to the console"
          @click="onCopy(index)"
        >
          <font-awesome-icon :icon="['fas', 'copy']" />
        </b-button>
        <b-button
          variant="outline-light"
          size="sm"
          v-b-tooltip.noninteractive
          title="Close"
          @click="onClose(index)"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </b-button>
      </template>
      <div v-if="result.response" class="p-3">
        <ResultTable
          :keys="result.response.keys"
          :rows="result.response.result"
        />
      </div>
      <b-alert :show="result.showError" variant="danger">
        <ErrorShow :response="result.errorData" />
      </b-alert>
    </main-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import moment from 'moment'

import SqlAPI, { SQLResponse } from '@/api/sql'
import { DefaultResponse } from '@/types/user'

import ErrorShow from '@/components/ErrorShow.vue'
import MainCard from '@/components/ui/MainCard.vue'
import ResultTable from '@/components/ResultTable.vue'
import RightsBreakdown from '@/components/ui/RightsBreakdown.vue'
import SQLInput from '@/components/SQLInput.vue'

const Mappers = Vue.extend({})

interface Result {
  code: string
  response?: SQLResponse
  errorData?: any
  showError: boolean
  name: string
}

@Component({
  components: { ErrorShow, MainCard, ResultTable, RightsBreakdown, SQLInput },
})
export default class SQLConsole extends Mappers {
  private code: string = 'SELECT * FROM er1.task;'
  private results: Result[] = []
  private isSending: boolean = false

  private async onSend() {
    this.isSending = true
    const name = 'Query ' + moment().format('HH:mm:ss')

    try {
      const response = await SqlAPI.sendRequest(this.code)
      this.results.unshift({
        code: this.code,
        response: response.data,
        showError: false,
        name,
      })
    } catch (err) {
      this.results.unshift({
        code: this.code,
        errorData: err.response.data,
        showError: true,
        name,
      })
    }
    this.isSending = false
  }

  private onClose(index: number) {
    this.results.splice(index, 1)
  }

  private onCopy(index: number) {
    this.code = this.results[index].code
    window.scrollTo(0, 0)
  }
}
</script>

<style scoped></style>
