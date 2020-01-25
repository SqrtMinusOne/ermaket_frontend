import { Component, Vue } from 'vue-property-decorator'

@Component({
  template: `
    <div
      @click="onSortClicked"
      ref="root"
      class="w-100 h-100 d-flex align-items-center"
    >
      <i class="fas fa-key mr-2" v-if="params.isPk" />
      <div>{{ params.displayName }}</div>
      <div v-if="params.enableSorting" v-html="sortIcon" class="ml-2" />
      <div class="ml-auto mr-2 d-flex darken_hover" :style="filterStyle" @click.stop="onFilterClicked" v-if="params.enableMenu">
        <i class="fas fa-filter my-auto mx-auto"></i>
      </div>
    </div>
  `,
})
export default class TableHeader extends Vue {
  private params!: any
  private sortIcon: string = ''
  private sort: string = ''

  private onSortClicked(event: any) {
    if (!this.params.enableSorting) {
      return
    }
    if (this.sort === '') {
      this.sort = 'asc'
      this.sortIcon = '<i class="fas fa-arrow-up"></i>'
    } else if (this.sort === 'asc') {
      this.sort = 'desc'
      this.sortIcon = '<i class="fas fa-arrow-down"></i>'
    } else {
      this.sort = ''
      this.sortIcon = ''
    }
    this.params.setSort(this.sort, event.shiftKey)
  }

  private get filterStyle() {
    return {
      width: '30px',
      height: '30px',
    } 
  }

  private onFilterClicked() {
    this.params.showColumnMenu(this.$refs.root)
  }
}
