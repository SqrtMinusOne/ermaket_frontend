<template>
  <div class="d-flex flex-column flex-fill">
    <TableComponent
      :id="Number($route.params.id)"
      class="d-flex flex-column flex-fill"
      fill
      />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TableComponent from '@/components/Table.vue'

@Component({
  components: {
    TableComponent
  }
})
export default class Table extends Vue {

}

</script>

<style scoped>

</style>
