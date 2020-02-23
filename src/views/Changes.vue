<template>
  <main-card name="Changes">
    <p v-if="breakdown.sum > 0">
      You have uncommited changes: <b>{{ breakdown.update }} changed</b> records, <b>{{ breakdown.create }} created</b> records and <b>{{ breakdown.delete }} deleted</b> records.
      <span v-if="breakdown.errors > 0"><b>{{ breakdown.errors }}</b> records have <b>errors</b>.</span>
    </p>
    <p v-else>
      You have no uncommited changes.
    </p>
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
  }
})

@Component({
  components: {
    MainCard,
    ChangeTable,
  }
})
export default class Changes extends Mappers {
}

</script>
