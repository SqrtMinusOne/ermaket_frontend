<template>
  <main-card name="Changes">
    <template v-slot:controls>
      <div
        class="ml-2"
        v-b-tooltip.noninteractive
        title="Validate the transaction"
      >
        <b-button
          variant="outline-light"
          size="sm"
          @click="onCheck"
          :disabled="isSending || breakdown.sum === 0 || areErrorsUpd"
        >
          <font-awesome-icon :icon="['fas', 'tasks']" />
          Run check
        </b-button>
      </div>
      <div class="ml-2" v-b-tooltip.noninteractive title="Revert all changes">
        <b-button
          variant="outline-light"
          size="sm"
          @click="onRevert"
          :disabled="isSending || breakdown.sum === 0"
        >
          <font-awesome-icon :icon="['fas', 'undo']" />
          Revert
        </b-button>
      </div>
      <div
        class="ml-2"
        v-b-tooltip.noninteractive
        title="Send changes to server"
      >
        <b-button
          variant="outline-light"
          size="sm"
          @click="onCommit"
          :disabled="isSending || breakdown.sum === 0"
        >
          <font-awesome-icon :icon="['fas', 'save']" />
          Commit
        </b-button>
      </div>
    </template>
    <b-alert
      :show="okCountDown"
      dismissible
      variant="success"
      @dismissed="okCountDown = 0"
      @dismiss-count-down="onCountDown = $event"
    >
      <font-awesome-icon :icon="['fas', 'check']" />
      Transaction successful
    </b-alert>
    <b-alert
      v-model="error"
      dismissible
      variant="danger"
      @dismissed="error = false"
    >
      <ErrorShow :response="errorData" />
    </b-alert>
    <p v-if="breakdown.sum > 0 && !isSending">
      You have uncommited changes:
      <b>{{ breakdown.update }} changed</b> records,
      <b>{{ breakdown.create }} created</b> records and
      <b>{{ breakdown.delete }} deleted</b> records.
      <span v-if="breakdown.errors > 0"
        ><b>{{ breakdown.errors }}</b> records have <b>errors</b>.</span
      >
    </p>
    <p v-else-if="!isSending">
      You have no uncommited changes.
    </p>
    <b-alert
      v-else
      variant="primary"
      show
      class="d-flex d-flex-row align-items-center"
    >
      <b-spinner variant="primary mr-2" />
      Sending changes...
    </b-alert>
    <ChangeTable />
    <b-modal
      ref="confirmBadModal"
      title="Confirm"
      header-bg-variant="primary"
      header-text-variant="light"
      ok-variant="primary"
      cancel-variant="outline-primary"
      @ok="onForceCommit"
    >
      The transaction has errors. Continue?
    </b-modal>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import MainCard from '@/components/ui/MainCard.vue'
import ChangeTable from '@/components/ChangeTable.vue'
import ErrorShow from '@/components/ErrorShow.vue'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['breakdown']),
    ...tableMapper.mapState(['areErrorsUpd']),
  },
  methods: {
    ...tableMapper.mapActions([
      'revertAll',
      'commitAll',
      'validateTransaction',
    ]),
  },
})

@Component({
  components: {
    MainCard,
    ChangeTable,
    ErrorShow,
  },
})
export default class Changes extends Mappers {
  private isSending: boolean = false
  private okCountDown: number = 0
  private error: boolean = false
  private errorData: any = null

  private async onCommit() {
    this.isSending = true
    if (!this.areErrorsUpd) {
      await this.validateTransaction()
    }
    if (this.breakdown.errors > 0) {
      (this.$refs.confirmBadModal as any).show()
      this.isSending = false
      return
    } else {
      await this.onForceCommit()
    }
  }

  private async onForceCommit() {
    this.isSending = true
    const error = await this.commitAll()
    if (!error) {
      this.okCountDown = 10
      this.error = false
      this.errorData = null
    } else {
      this.error = true
      this.errorData = error.response.data
    }
    this.isSending = false
  }

  private onCheck() {
    this.validateTransaction()
  }

  private onRevert() {
    this.revertAll()
  }
}
</script>
