<template>
  <div class="d-flex flew-row" v-if="buttonsHere.length > 0">
    <b-button
      v-for="(button, index) in buttonsHere"
      :key="index"
      :variant="button.variant || 'primary'"
      @click="onClick(button)"
      v-b-tooltip.hover.noninteractive
      :title="button.tooltip"
      v-bind="buttonAttrs"
      class="mr-2 d-flex flex-row"
    >
      <font-awesome-icon
        :icon="JSON.parse(button.icon)"
        v-if="button.icon"
        :class="{ 'mr-2': Boolean(button.text) }"
      />
      <div v-html="button.text" v-if="button.text" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import _ from 'lodash'

import { Button, ButtonLocation, Activation, SystemAction } from '@/types/user'
import { SystemModal } from '@/types/logic'
import { logicMapper } from '@/store/modules/logic'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  methods: {
    ...logicMapper.mapMutations(['openModal']),
    ...logicMapper.mapActions(['processCallScript']),
    ...userMapper.mapActions(['resetPasswordToken']),
  }
})

@Component
export default class LogicButtons extends Mappers {
  @Prop({ type: Array }) private readonly buttons?: Button[]
  @Prop({ type: String }) private readonly location!: ButtonLocation
  @Prop({ type: Object }) private readonly buttonAttrs: any
  @Prop({ type: Object, default: () => ({}) }) private readonly data!: any


  private get buttonsHere() {
    return (
      this.buttons?.filter((button) => button.location === this.location) || []
    )
  }

  private onClick(button: Button) {
    if (!_.isNil(button.scriptId)) {
      this.processCallScript({
        scriptId: button.scriptId,
        data: {
          activation: Activation.call,
          ...this.data
        }
      })
      return
    }
    switch (button.action!) {
      case SystemAction.passToken:
        this.resetPasswordToken({ login: this.data.row.login })
        break
      case SystemAction.regToken:
        this.openModal(SystemModal.regToken)
        break
    }
  }
}
</script>
