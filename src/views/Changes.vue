<template>
  <main-card name="Changes">
    <template v-slot:controls>
      <b-button
        class="ml-2"
        variant="outline-light"
        size="sm"
        v-b-tooltip.noninteractive
        title="Revert all changes"
        @click="onRevert"
        :disabled="isSending"
      >
        <font-awesome-icon :icon="['fas', 'undo']" />
        Revert
      </b-button>
      <b-button
        class="ml-2"
        variant="outline-light"
        size="sm"
        v-b-tooltip.noninteractive
        title="Send changes to server"
        @click="onCommit"
        :disabled="isSending"
      >
        <font-awesome-icon :icon="['fas', 'save']" />
        Commit
      </b-button>
    </template>
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
    <b-alert v-else variant="primary" show class="d-flex d-flex-row align-items-center">
      <b-spinner variant="primary mr-2" />
      Sending changes...
    </b-alert>
    <ChangeTable />
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import MainCard from '@/components/ui/MainCard.vue'
import ChangeTable from '@/components/ChangeTable.vue'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['breakdown']),
  },
  methods: {
    ...tableMapper.mapActions(['revertAll', 'commitAll'])
  }
})

@Component({
  components: {
    MainCard,
    ChangeTable,
  },
})
export default class Changes extends Mappers {
  private isSending: boolean = false

  private async onCommit() {
    this.isSending = true
    this.commitAll()
    this.isSending = false
  }

  private onRevert() {
    this.revertAll()
  }
}
</script>
