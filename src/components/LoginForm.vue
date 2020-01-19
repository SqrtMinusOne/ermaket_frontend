<template>
  <b-card
    header="Sign in"
    header-bg-variant="primary"
    header-text-variant="white"
  >
    <b-card-text>
      <b-form @submit="onLogin">
        <b-form-group label="Login" label-for="login-input">
          <b-form-input id="login-input" v-model="form.login" />
        </b-form-group>
        <b-form-group label="Password" label-for="password-input">
          <b-form-input
            id="password-input"
            v-model="form.password"
            type="password"
          />
        </b-form-group>
        <b-button type="submit" variant="primary">Login</b-button>
      </b-form>
    </b-card-text>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  methods: {
    ...userMapper.mapActions(['login'])
  }
})

@Component
export default class LoginForm extends Mappers {
  public form = {
    login: '' as string,
    password: '' as string,
  }

  public async onLogin(e: Event) {
    e.preventDefault()
    await this.login(this.form)
    this.$router.push('/home')
  }
}
</script>

<style scoped></style>
