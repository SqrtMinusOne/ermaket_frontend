<template>
  <b-navbar
    toggleable="md"
    type="dark"
    variant="primary"
    fixed
    class="d-flex flex-row"
  >
    <b-navbar-brand to="/">ERMaket</b-navbar-brand>
    <b-progress
      :max="progressMax"
      :variant="progressVariant"
      class="flex-fill"
      v-if="showProgress"
      :animated="progressAnimate"
    >
      <b-progress-bar :value="progressValue" :label="progressLabel" />
    </b-progress>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse
      id="nav-collapse"
      is-nav
      class="ml-auto"
      style="flex-grow: unset !important;"
    >
      <b-navbar-nav class="" v-if="isLoggedIn">
        <b-nav-item to="/changes" v-if="hasChanges">
          <b-button
            variant="outline-light"
            size="sm"
            block
            v-b-tooltip.hover.noninteractive
            title="You have uncommited changes"
          >
            <font-awesome-icon :icon="['fas', 'pen']" />
            Changes
          </b-button>
        </b-nav-item>
        <b-nav-item @click="onLogout">
          <b-button variant="outline-light" size="sm" block>
            <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
            Logout
          </b-button>
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav v-else class="ml-auto">
        <b-nav-item to="/signup">
          <b-button variant="outline-light" size="sm" block>
            <font-awesome-icon :icon="['fas', 'user-plus']" />
            Sign up
          </b-button>
        </b-nav-item>
        <b-nav-item to="/login">
          <b-button variant="outline-light" size="sm" block>
            <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
            Sign in
          </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'
import { progressMapper } from '@/store/modules/progress'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
    ...tableMapper.mapGetters(['hasChanges']),
    ...progressMapper.mapState(['enqueued', 'processed', 'errors']),
    ...progressMapper.mapGetters(['showProgress']),
  },
  methods: {
    ...progressMapper.mapMutations(['reset']),
    ...userMapper.mapActions({
      logout: 'logout',
    }),
  },
})

@Component
export default class Navbar extends Mappers {
  private async onLogout() {
    await this.logout()
    this.$router.push('/login')
  }

  private get progressMax() {
    return this.processed === 0 ? 1 : this.enqueued
  }

  private get progressValue() {
    return this.processed === 0 ? 1 : this.processed
  }

  private get progressAnimate() {
    return this.enqueued > this.processed
  }

  private get progressVariant() {
    return this.errors === 0 ? 'secondary' : 'danger'
  }

  // @Watch('errors')
  // private onErrorsChanged(errors: number) {
  //   if (errors > 0 && this.enqueued <= this.processed) {
  //     setTimeout(() => {
  //       this.reset()
  //     }, 1000)
  //   }
  // }

  private get progressLabel() {
    if (this.enqueued === 0) {
      if (this.errors === 1) {
        return 'Error'
      }
      return `Errors: ${this.errors}`
    }
    let str = this.enqueued === 1 ? 'Loading..' : `${this.processed}/${this.enqueued}`
    if (this.errors > 0) {
      str += ` (Errors: ${this.errors})`
    }
    return str
  }
}
</script>

<style></style>
