<template>
  <main-card name="Login">
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
      <b-button type="submit" variant="primary" class="mr-2">Login</b-button>
      <b-button @click="resetPass" variant="outline-primary">Reset password</b-button>
    </b-form>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { userMapper } from '@/store/modules/user'
import MainCard from '@/components/ui/MainCard.vue'
import ErrorShow from '@/components/ErrorShow.vue'

const Mappers = Vue.extend({
  methods: {
    ...userMapper.mapActions(['login']),
  },
  computed: {
    ...userMapper.mapGetters(['home', 'route'])
  },
})

@Component({
  components: { ErrorShow, MainCard },
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
      this.$router.push(this.route(this.home))
      this.showError = false
    } else {
      this.errorData = error.response.data
      this.showError = true
    }
  }

  public resetPass() {
    this.$router.push('/password')
  }
}
</script>

<style scoped></style>
