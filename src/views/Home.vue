<template>
  <div>
    <Sidebar @on-collapse="onCollapse" />
    <div :style="contentStyle" class="d-flex flex-column min-vh-100">
      <Navbar />
      <div class="d-flex flex-column flex-fill overflow-auto px-3 pt-2">
        <LogicShow />
        <router-view />
      </div>
    </div>
    <RegistrationTokenModal ref="regModal" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import { logicMapper } from '@/store/modules/logic'
import { SystemModal } from '@/types/logic'

import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import LogicShow from '@/components/LogicShow.vue'
import RegistrationTokenModal from '@/components/RegistrationTokenModal.vue'


const Mappers = Vue.extend({
  computed: {
    ...logicMapper.mapState(['systemModal'])
  }
})

@Component({
  components: { Sidebar, Navbar, LogicShow, RegistrationTokenModal },
})
export default class Home extends Mappers {
  private sidebarWidth = 350
  private sidebarCollapsedWidth = 50
  private sidebarCollapsed = false

  @Watch('systemModal')
  private onModalChange(modal: SystemModal) {
    if (modal === SystemModal.regToken) {
      (this.$refs.regModal as any).show()
    }
  }

  private onCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed
  }

  get contentStyle() {
    const width = this.sidebarCollapsed
      ? this.sidebarCollapsedWidth
      : this.sidebarWidth
    return {
      'margin-left': `${width}px`,
    }
  }
}
</script>

<style scoped></style>
