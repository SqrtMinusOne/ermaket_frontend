import TableComponent from '@/components/Table.vue'
import { Component, Vue } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { LinkedColumn, Table, TableLinkType } from '@/types/user'
import { LoadedRecord } from '@/types/tables'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import _ from 'lodash'

interface Params extends ICellRendererParams {
  [key: string]: any
}

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord']),
  },
})

@Component({
  template: `
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
          <div class="ml-auto">
            <b-button @click="toggleEdit" variant="outline-light" size="sm">
              <font-awesome-icon :icon="['fas', 'pencil-alt']" v-if="edit" />
              <font-awesome-icon :icon="['fas', 'eye']" v-else />
              {{ !edit ? 'View mode' : 'Edit mode' }}
            </b-button>
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
            <b-button
              v-b-tooltip.hover.noninteractive title="Close linked table"
              @click="onClose"
              variant="outline-light"
              size="sm"
              >
              <font-awesome-icon :icon="['fas', 'times']" />
            </b-button>
          </div>
        </div>
      </template>
      <TableComponent
        :id="table.id"
        style="height: 300px"
        :keys="record.data[this.column.rowName]"
        :keysParams="keysParams"
        :autoLoad="autoLoad"
        @change="onKeysChange"
        @modelsChanged="onModelsChanged"
        ref="table"
      />
    </b-card>
  `,
})
export default class LinkedTableRenderer extends Mappers {
  private params!: Params
  private record!: LoadedRecord
  private wasSorted: boolean = false
  private edit: boolean = false
  private autoLoad: boolean = false

  private created() {
    this.record = this.getRecord(this.params.table.id, this.key) as LoadedRecord
  }

  private onKeysChange(event: any) {
    console.log(event)
  }

  private onModelsChanged() {
    if (this.$refs.table) {
      const api = (this.$refs.table as any).gridApi
      if (api) {
        this.wasSorted = !_.isEmpty(api.getFilterModel()) || !_.isEmpty(api.getSortModel())
      }
    }
  }

  private toggleAutoLoad() {
    this.autoLoad = !this.autoLoad
  }

  private resetTable() {
    if (this.$refs.table) {
      const api = (this.$refs.table as any).gridApi
      if (api) {
        api.setFilterModel(null)
        api.setSortModel(null)
      }
    }
  }

  private onClose() {
    this.params.context.parent.onLinkedClose(this.key)
  }

  private toggleEdit() {
    this.edit = !this.edit
  }

  private get key() {
    return this.params.data[this.params.pk.rowName]
  }

  private get keysParams() {
    return {
      edit: this.edit,
      column: this.column
    }
  }

  private get column(): LinkedColumn {
    return this.params.data._linked
  }

  private get table() {
    return this.getTable(this.column.linkSchema, this.column.linkTableName)
  }
}
