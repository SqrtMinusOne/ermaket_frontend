<template>
  <div class="w-100">
    <b-alert
      v-for="(message, index) in messages"
      :key="index"
      :variant="message.variant"
      @dismissed="onCloseMessage(index)"
      show
      dismissible
    >
      {{ message.message }}
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

// FIXME multiple messages closing

@Component
export default class LogicShow extends Mappers {
  public onCloseMessage(index: number) {
    this.closeMessage(index)
  }
}
</script>
