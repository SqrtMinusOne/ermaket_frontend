<template>
  <main-card name="SQL Console" no-body>
    <div class="p-2">
      Hello!!
    </div>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import MainCard from '@/components/ui/MainCard.vue'
// import RightsBreakdown from '@/components/ui/RightsBreakdown.vue'

const Mappers = Vue.extend({})

@Component({
  components: { MainCard },
})
export default class SQLConsole extends Mappers {}
</script>

<style scoped></style>
