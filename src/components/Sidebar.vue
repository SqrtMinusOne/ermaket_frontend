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
import { HierarchyElem, Section, Table, Form, PrebuiltPage, PrebuiltPageType } from '@/types/user'
import { instanceOfSection, instanceOfTable, instanceOfForm, instanceOfPrebuiltPage } from '@/types/user_guards'
// tslint:disable-next-line:no-var-requires
const SidebarMenu = require('vue-sidebar-menu').SidebarMenu

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapState(['hierarchy']),
    ...userMapper.mapGetters(['hierarchyElem']),
  },
})

interface Icon {
  element: string
  class: string
  attributes?: any
  text?: any
}

interface Item {
  href: string | object
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
  private makeMenuElem(element: HierarchyElem): Item {
    if (instanceOfTable(element) && !element.hidden) {
      return this.makeTable(element as Table)
    }
    if (instanceOfSection(element)) {
      return this.makeSection(element as Section)
    }
    if (instanceOfForm(element)) {
      return this.makeForm(element as Form)
    }
    // TODO page
    return this.makePrebuiltPage(element as PrebuiltPage)
  }

  private makeTable(element: Table): Item {
    return {
      title: element.name,
      href: { path: `/table/${element.id}` },
      icon: 'fas fa-table'
    }
  }

  private makeSection(element: Section): Item {
    const children: Item [] = []
    for (const id of element.children) {
      children.push(this.makeMenuElem(this.hierarchyElem(id) as HierarchyElem))
    }
    return {
      title: element.name,
      href: '#',
      icon: 'fas fa-caret-right',
      child: children,
    }
  }

  private makeForm(element: Form): Item {
    return {
      title: element.name,
      href: { path: `/forms/${element.id}` },
      icon: 'fas fa-wpforms'
    }
  }

  private makePrebuiltPage(element: PrebuiltPage): Item {
    const data: Item = {
      title: element.name,
      href: '#'
    }
    switch(element.type) {
      case PrebuiltPageType.sql:
        data.href = '/system/sql'
        data.icon = 'fas fa-code'
        break
    }

    return data
  }

  private get menu () {
    if (this.hierarchy === null) {
      return []
    }
    const menu: Menu = [
      {
        header: true,
        title: 'Navigation',
        hiddenOnCollapse: true
      },
    ]
    for (const rootId of this.hierarchy.root) {
      menu.push(this.makeMenuElem(this.hierarchyElem(rootId) as HierarchyElem))
    }

    return menu
  }

  @Emit()
  private onCollapse(collapsed: boolean) {
    return collapsed
  }
}

</script>

<style scoped>
</style>
