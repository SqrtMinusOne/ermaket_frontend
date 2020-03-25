<template>
  <div class="w-100">
    <b-alert
      v-for="(message, index) in messages"
      :key="index"
      :variant="message.variant"
      class="d-flex flex-row align-items-center px-2 py-1"
      show
    >
      <div v-html="message.message" />
      <div
        class="d-flex darken_hover ml-auto"
        :style="hoverIconStyle"
        @click.stop="onCloseMessage(index)"
      >
        <font-awesome-icon :icon="['fas', 'times']" class="my-auto mx-auto" />
      </div>
    </b-alert>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { logicMapper } from '@/store/modules/logic'

const Mappers = Vue.extend({
  computed: {
    ...logicMapper.mapState(['messages']),
  },
  methods: {
    ...logicMapper.mapMutations(['closeMessage']),
  },
})

@Component
export default class LogicShow extends Mappers {
  private hoverIconStyle = {
    width: '30px',
    height: '30px',
  }

  public onCloseMessage(index: number) {
    this.closeMessage(index)
  }
}
</script>
