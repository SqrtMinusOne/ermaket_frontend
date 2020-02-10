<template>
  <main-card name="Changes">
    <p>
    You have uncommited changes: <b>{{ breakdown.change }} changed</b> records, <b>{{ breakdown.create }} created</b> records and <b>{{ breakdown.delete }} deleted</b> records.
    </p>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { tableMapper } from '@/store/modules/table'
import MainCard from '@/components/ui/MainCard.vue'

const Mappers = Vue.extend({
  computed: {
    ...tableMapper.mapGetters(['breakdown'])
  }
})

@Component({
  components: {
    MainCard
  }
})
export default class Changes extends Mappers {

}

</script>
