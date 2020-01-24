<template>
  <SidebarMenu :menu="menu" @toggle-collapse="onCollapse">
    <span slot="toggle-icon">
      <b-icon-list font-scale="2" />
    </span>
    <span slot="dropdown-icon">
      <b-icon-chevron-down font-scale="2" />
    </span>
  </SidebarMenu>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import { userMapper } from '../store/modules/user'
// tslint:disable-next-line:no-var-requires
const SidebarMenu = require('vue-sidebar-menu').SidebarMenu

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapState(['hierarchy']),
  },
})

interface Icon {
  element: string
  class: string
  attributes?: any
  text?: any
}

interface Item {
  href: string
  title: string
  icon?: Icon | string
  badge?: Icon
  child?: Item[]
  disabled?: boolean
  class?: string
  attributes?: any
  exactPath?: boolean
  alias?: boolean
  hidden?: boolean
  hiddenOnCollapse?: boolean
}

interface HeaderItem {
  header: true
  title: string
  attributes?: any
  hidden?: boolean
  hiddenOnCollapse?: boolean
}

interface ComponentItem {
  component: string
  props?: any
  hidden?: boolean
  hiddenOnCollapse?: boolean
}

interface Menu extends Array<Item|HeaderItem|ComponentItem> {}


@Component({
  components: { SidebarMenu }
})
export default class Home extends Mappers {
  private get menu () {
    if (this.hierarchy === null) {
      return []
    }
    const menu: Menu = [
      {
        header: true,
        title: 'Main Navigation',
        hiddenOnCollapse: true
      },
      {
        href: '/',
        title: 'Dashboard',
        icon: 'fa fa-user'
      },
      {
        href: '/charts',
        title: 'Charts',
        icon: 'fa fa-chart-area',
        child: [
          {
            href: '/charts/sublink',
            title: 'Sub Link'
          }
        ]
      }
    ]
    return menu
  }
  
  @Emit()
  public onCollapse(collapsed: boolean) {
    return collapsed
  }
}

</script>

<style scoped>
</style>
