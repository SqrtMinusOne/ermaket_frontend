<template>
  <div>
    <Navbar />
    <b-container fluid>
      <b-row align-h="center" align-v="center" class="mt-3">
        <b-col sm="12" md="6">
          <LogicShow />
          <router-view />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LoginForm from '@/components/system_forms/LoginForm.vue'
import LogicShow from '@/components/LogicShow.vue'
import Navbar from '@/components/Navbar.vue'
import { userMapper } from '@/store/modules/user'
import { Route } from 'vue-router'

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

@Component({
  components: { LoginForm, Navbar, LogicShow },
})
export default class Login extends Mappers {
  @Watch('isLoggedIn')
  private onLoggedIn() {
    if (this.isLoggedIn) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped></style>
