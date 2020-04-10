<template>
  <main-card name="Sign up">
    <b-alert
      variant="danger"
      :show="showError"
      @dimissed="showError = false"
      dismissible
    >
      <ErrorShow :response="errorData" />
    </b-alert>
    <vue-form-generator
      :schema="schema"
      :model="model"
      :options="formOptions"
      @validated="onValidated"
    />
    <b-button @click="onSubmit" variant="primary" :disabled="!isValid" class="mr-2">
      {{ resetPass ? 'Reset password' : 'Sign up' }}
    </b-button>
    <b-button @click="onBack" variant="outline-primary">
      Back to login
    </b-button>
  </main-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { userMapper } from '@/store/modules/user'
import { FormSchema } from '@/types/user'
import MainCard from '@/components/ui/MainCard.vue'
import ErrorShow from '@/components/ErrorShow.vue'

// tslint:disable-next-line:no-var-requires
const { validators } = require('vue-form-generator')

function emptyModel() {
  return {
    token: '',
    login: '',
    password: '',
    repeatPassword: '',
  }
}

function repeatPassword(value: string, field: any, model: any) {
  if (value !== model.password) {
    return ['Passwords do not match']
  }
  return []
}

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['home', 'route'])
  },
  methods: {
    ...userMapper.mapActions(['signUp', 'resetPassword']),
  },
})

@Component({ components: { MainCard, ErrorShow } })
export default class SignUpForm extends Mappers {
  private model: {
    token: string
    login: string
    password: string
    repeatPassword: string
  } = emptyModel()

  private isValid: boolean = true
  private errorData: any = {}
  private showError: boolean = false

  private schema: FormSchema = {
    fields: [
      {
        type: 'input',
        inputType: 'text',
        model: 'login',
        label: 'Login',
        required: true,
        validator: [validators.string, validators.required],
      },
      {
        type: 'input',
        inputType: 'password',
        model: 'password',
        label: 'Password',
        required: true,
        min: 6,
        validator: [validators.string, validators.required],
      },
      {
        type: 'input',
        inputType: 'password',
        model: 'repeatPassword',
        label: 'Repeat password',
        required: true,
        min: 6,
        validator: [validators.string, repeatPassword],
      },
      {
        type: 'input',
        inputType: 'text',
        model: 'token',
        label: 'Token',
        required: true,
        validator: [validators.string, validators.required],
      },
    ],
  }

  private formOptions = {
    validateAfterChanged: true,
    validateAfterLoad: true,
  }

  private onValidated(isValid: boolean) {
    this.isValid = isValid
  }

  private get resetPass() {
    return this.$route.path.includes('password')
  }

  private async onSubmit() {
    const error = this.resetPass
      ? await this.resetPassword(this.model)
      : await this.signUp(this.model)
    if (!error) {
      this.$router.push(this.route(this.home))
      this.showError = false
    } else {
      this.errorData = error.response.data
      this.showError = true
    }
  }

  private onBack() {
    this.$router.push('/login')
  }
}
</script>
