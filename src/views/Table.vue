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
        @click="saveCSV"
        variant="outline-light"
        class="mr-1"
        size="sm"
        v-b-tooltip.hover.noninteractive
        title="Export table"
      >
        <font-awesome-icon :icon="['fas', 'file-export']" />
        Export
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
      @formEdit="onFormEdit"
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
    <FormEditor
      :form="table.formDescription"
      :tableId="table.id"
      ref="formEditor"
      @updated="onFormEdited"
    />
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { RowNode } from 'ag-grid-community'

import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import { logicMapper } from '@/store/modules/logic'
import { instanceOfTable } from '@/types/user_guards'
import { Table as TableElem, Access } from '@/types/user'
import handleLogic from '@/router/logic_handler'

import FormModal from '@/components/FormModal.vue'
import FormEditor from '@/components/FormEditor.vue'
import MainCard from '@/components/ui/MainCard.vue'
import SpinnerModal from '@/components/ui/SpinnerModal.vue'
import RightsBreakdown from '@/components/ui/RightsBreakdown.vue'
import TableComponent from '@/components/Table.vue'
import TableControls from '@/mixins/table_controls'

const Mappers = Mixins(TableControls).extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
    ...logicMapper.mapState(['messages'])
  },
  methods: {
    ...tableMapper.mapActions(['addRecord'])
  }
})

@Component({
  components: { MainCard, RightsBreakdown, FormModal, SpinnerModal, FormEditor },
})
export default class Table extends Mappers {
  private formData: any
  private formKey: number = 0
  private editedNode?: RowNode

  private get id() {
    return Number(this.$route.params.id)
  }

  beforeRouteUpdate(to: Route, from: Route, next: any) {
    handleLogic(to, from, next)
  }

  @Watch('messages', { deep: true })
  private onLogicMessage() {
    setTimeout(() => { // FIXME
      this.tableComponent.setTableHeight()
    }, 100)
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

  private onFormEdit(key: string | number, node: RowNode) {
    const editor = this.$refs.formEditor as any
    this.editedNode = node
    editor.show(key)
  }

  private onFormEdited(key: number | string, data: any) {
    this.editedNode!.setData({
      ...this.editedNode!.data,
      ...data
    })
    this.tableComponent.gridApi!.redrawRows({ rowNodes: [this.editedNode!] })
    this.tableComponent.onUpdate()
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

  private get tableComponent(): TableComponent {
    return this.$refs.table as TableComponent
  }
}
</script>

<style scoped></style>
