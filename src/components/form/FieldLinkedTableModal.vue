<template>
  <div class="d-flex flex-row w-100">
    <b-form-input class="flex-grow-1" :value="displayValue" readonly />
    <b-button
      @click="onClick"
      class="ml-2"
      v-b-tooltip.noninteractive
      title="Open linked table"
    >
      <font-awesome-icon :icon="['fas', 'table']" />
    </b-button>
    <b-modal hide-header hide-footer ref="modal" size="xl" body-class="p-0">
      <main-card :name="schema.table.name" no-body>
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
          <b-button
            v-b-tooltip.hover.noninteractive
            title="Close linked table"
            @click="onClose"
            variant="outline-light"
            size="sm"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </b-button>
        </template>
        <TableComponent
          :id="schema.table.id"
          style="height: 300px"
          v-model="keys"
          @change="onChange"
          :keysParams="keysParams"
          :autoLoad="autoLoad"
          @modelsChanged="onModelsChanged"
          ref="table"
        />
      </main-card>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import TableControls from '@/mixins/table_controls'
import MainCard from '@/components/ui/MainCard.vue'
// tslint:disable-next-line:no-var-requires
const abstractField = require('vue-form-generator').abstractField
import { LinkedColumn } from '@/types/user'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'

import _ from 'lodash'

const Mappers = Mixins(abstractField, TableControls).extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['getRecord']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord', 'setRecordUpdate']),
  },
})

@Component({
  components: { MainCard },
})
export default class FieldLinkedSelect extends Mappers {
  private schema!: any
  private value!: any
  private keys: any[] = []

  private onClick() {
    const modal = this.$refs.modal as any
    modal.show()
  }

  private created() {
    if (_.isNil(this.value)) {
      if (this.column.isMultiple) {
        this.value = []
      }
    }
  }

  private get displayValue() {
    if (_.isArray(this.keys)) {
      return this.keys.join(', ')
    }
    return this.keys
  }

  private get column() {
    return this.schema.column as LinkedColumn
  }

  private onChange(event: any) {
    this.$set(this, 'value', event)
  }

  private onClose() {
    const modal = this.$refs.modal as any
    modal.hide()
  }

  private get keysParams() {
    return {
      edit: true,
      column: this.schema.column,
    }
  }
}
</script>

<style scoped></style>
