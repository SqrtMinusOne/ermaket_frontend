<template>
  <b-navbar toggleable="md" type="dark" variant="primary" fixed>
    <b-navbar-brand to="/">ERMaket</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="!isLoggedIn" to="/login">Login</b-nav-item>
        <b-nav-item v-else @click="onLogout">Logout</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { userMapper } from '../store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
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
