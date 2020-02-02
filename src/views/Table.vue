<template>
  <div class="d-flex flex-column flex-fill">
    <b-card
      border-variant="primary"
      header-bg-variant="primary"
      header-text-variant="white"
      header-class="small_card_header"
      no-body
    >
      <template v-slot:header>
        <div class="d-flex flex-row align-items-center">
          <b>{{ table.name }}</b>
          <!-- <div class="ml-auto"> -->
          <!--   <b-button @click="toggleEdit" variant="outline-light" size="sm"> -->
          <!--     <font-awesome-icon :icon="['fas', 'pencil-alt']" v-if="!edit" /> -->
          <!--     <font-awesome-icon :icon="['fas', 'eye']" v-else /> -->
          <!--     {{ edit ? 'View' : 'Edit' }} -->
          <!--   </b-button> -->
          <!-- </div> -->
        </div>
      </template>
      <TableComponent
        :id="Number($route.params.id)"
        class="d-flex flex-column flex-fill"
        fill
      />
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { instanceOfTable } from '@/types/user_guards'
import { Table as TableElem } from '@/types/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
})

@Component({})
export default class Table extends Mappers {
  private get id() {
    return Number(this.$route.params.id)
  }

  private created() {
    if (!instanceOfTable(this.hierarchyElem(this.id))) {
      this.$router.push('/page_not_exists')
    }
  }

  private get table(): TableElem {
    return this.hierarchyElem(this.id) as TableElem
  }
}
</script>

<style scoped></style>
