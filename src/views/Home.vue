<template>
  <div>
    <Sidebar @on-collapse="onCollapse" />
    <div :style="contentStyle" class="d-flex flex-column min-vh-100">
      <Navbar />
      <div class="d-flex flex-column justify-content-center flex-fill overflow-auto px-3 pt-2">
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
