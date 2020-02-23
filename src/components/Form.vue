<template>
  <vue-form-generator :schema="form.formSchema" :model="formData" :options="options" @model-updated="onModelUpdated" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Model } from 'vue-property-decorator'
import { FormDescription } from '@/types/user'

@Component
export default class Form extends Vue {
  @Model('change', { type: Object }) private readonly formData!: any
  @Prop({ type: Object }) private form!: FormDescription

  private options = {}

  private onModelUpdated() {
    this.$emit('change', this.formData)
  }
}

</script>

<style scoped>

</style>
