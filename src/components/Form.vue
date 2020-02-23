<template>
  <vue-form-generator
    :schema="form.formSchema"
    :model="formData"
    :options="formOptions"
    @model-updated="onModelUpdated"
    @validated="onValidated"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'
import { FormDescription } from '@/types/user'

@Component
export default class Form extends Vue {
  public isValid: boolean = false

  @Model('change', { type: Object }) private readonly formData!: any
  @Prop({ type: Object }) private form!: FormDescription
  @Prop({ type: Object }) private options!: any

  private formOptions = {
    validateAfterChanged: true,
    validateAfterLoad: true,
  }

  private created() {
    this.formOptions = {
      ...this.formOptions,
      ...this.options,
    }
  }

  private onValidated(isValid: boolean) {
    this.$set(this, 'isValid', isValid)
    this.$emit('validated', isValid)
  }

  private onModelUpdated() {
    this.$emit('change', this.formData)
  }
}
</script>

<style scoped></style>
