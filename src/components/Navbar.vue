<template>
  <b-navbar toggleable="md" type="dark" variant="primary" fixed>
    <b-navbar-brand to="/">ERMaket</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto" v-if="isLoggedIn">
        <b-nav-item to="/changes" v-if="hasChanges" >
          <b-button variant="outline-light" size="sm" block v-b-tooltip.hover.noninteractive title="You have uncommited changes">
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
      <b-navbar-nav v-else>
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

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
    ...tableMapper.mapGetters(['hasChanges'])
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

  mounted() {
    console.log(this.hasChanges)
  }
}
</script>

<style></style>
