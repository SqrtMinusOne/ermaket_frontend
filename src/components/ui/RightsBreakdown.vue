<template>
  <b-button v-b-popover.hover.noninteractive="popover" v-bind="$attrs">
    <font-awesome-icon :icon="['fas', 'key']" /> Access rights
  </b-button>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import AccessBreakdown from '@/mixins/access_breakdown'

@Component
export default class RightsBreakdown extends Mixins(AccessBreakdown) {
  @Prop({ type: Number, required: true }) private readonly id!: number

  private get popover() {
    return {
      title: 'Access rights',
      html: true,
      content: this.getRightsHtml(this.id)
    }
  }
}

</script>

<style scoped>

</style>
