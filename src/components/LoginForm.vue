<template>
  <b-card
    header="Sign in"
    header-bg-variant="primary"
    header-text-variant="white"
  >
    <b-card-text>
      <b-alert
        variant="danger"
        :show="showError"
        @dimissed="showError = false"
        dismissible
      >
        <ErrorShow :response="errorData" />
      </b-alert>
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
import ErrorShow from '@/components/ErrorShow.vue'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapState(['error']),
  },
  methods: {
    ...userMapper.mapMutations(['setError']),
    ...userMapper.mapActions(['login']),
  },
})

@Component({
  components: { ErrorShow },
})
export default class LoginForm extends Mappers {
  public form = {
    login: '' as string,
    password: '' as string,
  }

  private errorData: any = {}
  private showError: boolean = false

  public async onLogin(e: Event) {
    e.preventDefault()
    const error = await this.login(this.form)
    if (!error) {
      this.$router.push('/table/2')
      this.showError = false
    } else {
      this.errorData = error.response.data
      this.showError = true
    }
  }
}
</script>

<style scoped></style>
