<template>
  <main-card :name="table.name">
    <template v-slot:controls>
      <b-button
        @click="resetTable"
        variant="outline-light"
        size="sm"
        v-b-tooltip.hover.noninteractive
        title="Reset filters and sorting"
        v-if="wasSorted"
      >
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
    </template>
    <TableComponent
      :id="Number($route.params.id)"
      @modelsChanged="onModelsChanged"
      :autoLoadLinked="autoLoad"
      ref="table"
      fill
    />
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { instanceOfTable } from '@/types/user_guards'
import { Table as TableElem } from '@/types/user'
import MainCard from '@/components/ui/MainCard.vue'
import TableComponent from '@/components/Table.vue'
import TableControls from '@/mixins/table_controls'

const Mappers = Mixins(TableControls).extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
})

@Component({
  components: { MainCard },
})
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
