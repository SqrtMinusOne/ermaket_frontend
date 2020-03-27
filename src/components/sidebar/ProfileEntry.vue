<template>
  <b-card
    v-if="show"
    no-body
    text-variant="white"
    class="sidebar_component rounded-0 p-1"
  >
  <div class="d-flex flex-row align-items-center">
    <b-avatar variant="info" class="mr-2" />
      <div class="d-flex flex-column">
        <b>{{ user.login }}</b>
        <i> {{ roles }}</i>
      </div>
  </div>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import _ from 'lodash'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapState(['user']),
  },
})

@Component
export default class ProfileEntry extends Mappers {
  private get show() {
    return !_.isNil(this.user)
  }

  private get roles() {
    return this.user!.roles.join(' ,')
  }
}
</script>
