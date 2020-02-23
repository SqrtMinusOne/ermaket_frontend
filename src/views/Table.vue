<template>
  <main-card :name="table.name" no-body>
    <template v-slot:controls>
      <b-button
        @click="resetTable"
        variant="outline-light"
        class="mr-1"
        size="sm"
        v-b-tooltip.hover.noninteractive
        title="Reset filters and sorting"
        v-if="wasSorted"
      >
        <font-awesome-icon :icon="['fas', 'table']" />
      </b-button>
      <b-button
        v-if="canAdd"
        variant="outline-light"
        class="mr-1"
        size="sm"
        v-b-tooltip.hover.noninteractive
        title="Add new record"
        @click="onAdd"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        New
      </b-button>
      <b-button
        @click="toggleAutoLoad"
        variant="outline-light"
        class="mr-1"
        size="sm"
        v-b-tooltip.hover.noninteractive
        title="Toggle autoload of linked records"
      >
        <font-awesome-icon :icon="['fas', 'magnet']" v-if="autoLoad" />
        <font-awesome-icon :icon="['fas', 'mouse']" v-else />
        {{ autoLoad ? 'Auto' : 'Manual' }}
      </b-button>
      <rights-breakdown size="sm" variant="outline-light" :id="table.id" />
    </template>
    <TableComponent
      :id="Number($route.params.id)"
      @modelsChanged="onModelsChanged"
      :autoLoadLinked="autoLoad"
      ref="table"
      fill
    />
    <FormModal
      :form="table.formDescription"
      v-model="formData"
      ref="addModal"
      :key="formKey"
      @ok="onOk"
    />
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import { instanceOfTable } from '@/types/user_guards'
import { Table as TableElem, Access } from '@/types/user'

import FormModal from '@/components/FormModal.vue'
import MainCard from '@/components/ui/MainCard.vue'
import RightsBreakdown from '@/components/ui/RightsBreakdown.vue'
import TableComponent from '@/components/Table.vue'
import TableControls from '@/mixins/table_controls'

const Mappers = Mixins(TableControls).extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['addRecord'])
  }
})

@Component({
  components: { MainCard, RightsBreakdown, FormModal },
})
export default class Table extends Mappers {
  private formData: any
  private formKey: number = 0

  private get id() {
    return Number(this.$route.params.id)
  }

  private created() {
    if (!instanceOfTable(this.hierarchyElem(this.id))) {
      this.$router.push('/page_not_exists')
    }
    this.formData = {}
  }

  private onAdd() {
    this.$set(this, 'formData', {})
    this.formKey++
    this.$nextTick(() => {
      const modal = this.$refs.addModal as any
      modal.show()
    })
  }

  private onOk() {
    this.addRecord({ id: this.id, data: this.formData })
    const table = this.$refs.table as any
    table.update()
  }

  private get canAdd() {
    return this.table.userAccess.has(Access.change)
  }

  private get table(): TableElem {
    return this.hierarchyElem(this.id) as TableElem
  }
}
</script>

<style scoped></style>
