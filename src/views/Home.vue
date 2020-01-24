<template>
  <div>
    <Sidebar @on-collapse="onCollapse" />
    <div :style="contentStyle">
      <Navbar />
      <div class="containt-fluid mx-3 mt-2">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'

@Component({
  components: { Sidebar, Navbar },
})
export default class Home extends Vue {
  private sidebarWidth = 350
  private sidebarCollapsedWidth = 50
  private sidebarCollapsed = false

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
