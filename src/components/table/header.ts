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
      <div class="ml-auto mr-2 d-flex darken_hover" :style="filterStyle" @click.stop="onFilterClicked" v-if="params.enableMenu">
        <i class="fas fa-filter my-auto mx-auto"></i>
      </div>
    </div>
  `,
})
export default class TableHeader extends Mappers {
  private params!: any
  private sortIcon: string = ''
  private sort: string = ''

  private mounted() {
    this.params.column.addEventListener('sortChanged', this.onSortChanged)
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
      width: '30px',
      height: '30px',
    } 
  }

  private get isLinked() {
    return instanceOfLinkedColumn(this.params.columnElem)
  }

  private get column(): Column {
    return this.params.columnElem
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
