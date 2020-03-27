<template>
  <div class="d-flex flew-row" v-if="buttonsHere.length > 0">
    <b-button
      v-for="(button, index) in buttonsHere"
      :key="index"
      :variant="button.variant || 'primary'"
      @click="onClick(button.scriptId)"
      v-b-tooltip.hover.noninteractive
      :title="button.tooltip"
      v-bind="buttonAttrs"
      class="mr-2 d-flex flex-row">
      <font-awesome-icon :icon="JSON.parse(button.icon)" v-if="button.icon" :class="{ 'mr-2': Boolean(button.text) }" />
      <div v-html="button.text" v-if="button.text" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import _ from 'lodash'

import { Button, ButtonLocation, Activation } from '@/types/user'
import { logicMapper } from '@/store/modules/logic'

const Mappers = Vue.extend({
  methods: {
    ...logicMapper.mapActions(['processCallScript'])
  }
})

@Component
export default class LogicButtons extends Mappers {
  @Prop({ type: Array }) private readonly buttons?: Button[]
  @Prop({ type: String }) private readonly location!: ButtonLocation
  @Prop({ type: Object }) private readonly buttonAttrs: any


  private get buttonsHere() {
    return (
      this.buttons?.filter((button) => button.location === this.location) || []
    )
  }

  private onClick(scriptId: number) {
    this.processCallScript({
      scriptId,
      data: {
        activation: Activation.call
      }
    })
  }
}
</script>
