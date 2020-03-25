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
      :value="processed"
      :max="enqueued"
      variant="secondary"
      class="flex-fill"
      v-if="showProgress"
      show-progress
      animated
    />
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse
      id="nav-collapse"
      is-nav
      class="ml-auto"
      style="flex-grow: unset !important"
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
        <b-nav-item to="/login">
          <b-button variant="outline-light" size="sm" block>
            <font-awesome-icon :icon="['fas', 'sign-in-alt']" />
            Login
          </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'
import { progressMapper } from '@/store/modules/progress'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
    ...tableMapper.mapGetters(['hasChanges']),
    ...progressMapper.mapState(['enqueued', 'processed']),
    ...progressMapper.mapGetters(['showProgress']),
  },
  methods: {
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
}
</script>

<style></style>
