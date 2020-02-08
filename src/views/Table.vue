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
          <div class="ml-auto" style="height: 32px">
            <b-button 
              @click="resetTable" 
              variant="outline-light" 
              size="sm"
              v-b-tooltip.hover.noninteractive
              title="Reset filters and sorting"
              v-if="wasSorted">
              <font-awesome-icon :icon="['fas', 'table']" />
            </b-button>
            <b-button 
              @click="toggleAutoLoad" 
              variant="outline-light" 
              size="sm"
              v-b-tooltip.hover.noninteractive
              title="Toggle autoload of linked records"
              >
              <font-awesome-icon :icon="['fas', 'magnet']" v-if="autoLoad" />
              <font-awesome-icon :icon="['fas', 'mouse']" v-else />
              {{ autoLoad ? 'Auto' : 'Manual' }}
            </b-button>
          </div>
        </div>
      </template>
      <TableComponent
        :id="Number($route.params.id)"
        @modelsChanged="onModelsChanged"
        :autoLoadLinked="autoLoad"
        ref="table"
        fill
      />
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { instanceOfTable } from '@/types/user_guards'
import { Table as TableElem } from '@/types/user'
import TableComponent from '@/components/Table.vue'
import TableControls from '@/mixins/table_controls'

const Mappers = Mixins(TableControls).extend({
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
