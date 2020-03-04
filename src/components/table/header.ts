import { Component, Vue, Watch } from 'vue-property-decorator'
import { instanceOfLinkedColumn } from '@/types/user_guards'
import { Column, LinkedColumn } from '@/types/user'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable'])
  }
})

@Component({
  template: `
    <div
      @click="onSortClicked"
      ref="root"
      class="w-100 h-100 d-flex align-items-center"
    >
      <div class="mr-2" v-b-tooltip.hover.noninteractive title="Key attribute" v-if="params.isPk">
        <font-awesome-icon :icon="['fas', 'key']"/>
      </div>
      <div class="mr-2" v-b-tooltip.hover.noninteractive :title="linkTooltip" v-if="isLinked">
        <font-awesome-icon :icon="['fas', 'link']" />
      </div>
      <div>{{ params.displayName }}</div>
      <div v-if="params.enableSorting" v-html="sortIcon" class="ml-2" />
      <div class="ml-auto d-flex darken_hover" :style="filterStyle" @click.stop="onFilterClicked" v-if="params.enableMenu">
        <font-awesome-icon :icon="['fas', 'filter']" class="my-auto mx-auto" />
      </div>
      <div class="d-flex darken_hover" :style="hoverIconStyle" @click.stop="onFilterRemove" v-if="isFilter">
        <font-awesome-icon :icon="['fas', 'times']" class="my-auto mx-auto" />
      </div>
    </div>
  `,
})
export default class TableHeader extends Mappers {
  private params!: any
  private sortIcon: string = ''
  private sort: string = ''
  private isFilter: boolean = false
  private hoverIconStyle = {
    width: '30px',
    height: '30px',
  }

  private mounted() {
    this.params.column.addEventListener('sortChanged', this.onSortChanged)
    this.params.column.addEventListener('filterChanged', this.onFilterChanged)
  }

  private setSortIcon() {
    const model = this.params.api.getSortModel()
    const index = model.findIndex((sort: any) => sort.colId === this.params.column.colId)
    switch (this.sort) {
      case 'asc':
        this.sortIcon = '<i class="fas fa-arrow-up"></i>' + index
        break
      case 'desc':
        this.sortIcon = '<i class="fas fa-arrow-down"></i>' + index
        break
      default:
        this.sortIcon = ''
    }
  }

  private onSortChanged() {
    if (this.params.column.isSortAscending()) {
      this.sort = 'asc'
    } else if (this.params.column.isSortDescending()) {
      this.sort = 'desc'
    } else {
      this.sort = ''
    }
    this.setSortIcon()
  }

  private onFilterRemove() {
    const model = this.params.api.getFilterModel()
    delete model[this.params.column.colId]
    this.params.api.setFilterModel(model)
  }

  private onFilterChanged() {
    this.isFilter = this.params.column.isFilterActive()
  }

  private onSortClicked(event: any) {
    if (!this.params.enableSorting) {
      return
    }
    if (this.sort === '') {
      this.sort = 'asc'
    } else if (this.sort === 'asc') {
      this.sort = 'desc'
    } else {
      this.sort = ''
    }
    this.params.setSort(this.sort, event.ctrlKey)
    this.setSortIcon()
  }

  private get filterStyle() {
    return {
      'background-color': this.isFilter ? '#cccccc' : undefined,
      ...this.hoverIconStyle,
    }
  }

  private get isLinked() {
    return this.params.columnElem && instanceOfLinkedColumn(this.params.columnElem)
  }

  private get column(): Column {
    return this.params.columnElem || null
  }

  private get linkTooltip() {
    const linked = this.column as LinkedColumn
    const table = this.getTable(linked.linkSchema, linked.linkTableName)
    if (table) {
      return `Link attribute (to "${table.name}")`
    }
    return 'Link attribute'
  }

  private onFilterClicked() {
    this.params.showColumnMenu(this.$refs.root)
  }
}
