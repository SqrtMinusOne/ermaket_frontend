<template>
  <component v-if="ok && !elem.addCard" :is="elem.pageName" />
  <main-card v-else-if="ok" :name="elem.name" no-body>
    <template v-slot:controls>
      <LogicButtons location="cardHeader" :buttons="elem.buttonList" :buttonAttrs="{ size: 'sm' }" />
    </template>
    <LogicButtons class="m-1" location="top" :buttons="elem.buttonList" />
    <div class="px-2">
      <component :is="elem.pageName" />
    </div>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import pagesConfig from '@/pages-config'
import { HierarchyElem } from '@/types/user'
import { instanceOfPage } from '@/types/user_guards'
import { userMapper } from '@/store/modules/user'

import LogicButtons from '@/components/LogicButtons.vue'
import MainCard from '@/components/ui/MainCard.vue'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  }
})

const components: any = { MainCard, LogicButtons }

for (const pageConfig of pagesConfig) {
  components[pageConfig.pageName] = pageConfig.component
}

@Component({
  components
})
export default class PageView extends Mappers {
  created() {
    if (!this.ok) {
      this.$router.push('/page_not_exists')
    }
  }

  private get ok() {
    return instanceOfPage(this.elem)
  }

  private get elem(): HierarchyElem {
    return this.hierarchyElem(Number(this.$route.params.id))!
  }

}

</script>
