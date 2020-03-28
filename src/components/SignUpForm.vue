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
    <b-button @click="onSignUp" variant="primary" :disabled="!isValid"
      >Sign up</b-button
    >
  </main-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
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
  methods: {
    ...userMapper.mapActions(['signUp']),
  },
})

@Component({ components: { MainCard, ErrorShow } })
export default class SignUpForm extends Mappers {
  private model: {
    token: string
    login: string
    password: string
    repeatPassword: string
  } = {}

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

  private async onSignUp() {
    const error = await this.signUp(this.model)
    if (!error) {
      this.$router.push('/table/2') // FIXME?
      this.showError = false
    } else {
      this.errorData = error.response.data
      this.showError = true
    }
  }

  private created() {
    this.model = emptyModel()
  }
}
</script>
