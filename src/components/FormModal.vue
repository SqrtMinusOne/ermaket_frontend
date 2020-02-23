<template>
  <b-modal
    header-bg-variant="primary"
    header-text-variant="light"
    ok-variant="primary"
    cancel-variant="outline-primary"
    title="Add record"
    v-bind="$attrs"
    ref="modal"
    @ok="onOk"
    @cancel="$emit('cancel')"
    @hide="onHide"
    :ok-disabled="!isOk"
    >
    <Form :formData="formData" @change="onChange" :form="form" ref="form" @validated="onValidated" />
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from 'vue-property-decorator'
import { FormDescription } from '@/types/user'
import Form from '@/components/Form.vue'

@Component({
  components: { Form }
})
export default class FormModal extends Vue {
  @Model('change', { type: Object }) private readonly formData!: any
  @Prop({ type: Object }) private form!: FormDescription

  private isValid: boolean = false
  private saving: boolean = false
  private changed: boolean = false

  public show() {
    const modal = this.$refs.modal as any
    modal.show()
  }

  private onOk() {
    this.saving = true
    this.$emit('ok')
  }

  private onHide(event: any) {
    if (!this.saving && this.changed) {
      if (window.confirm('The data will be lost if you close the modal. Continue?')) {
        this.changed = false
      } else {
        event.preventDefault()
      }
    }
  }

  private get isOk() {
    return this.isValid
  }

  private onValidated(event: boolean) {
    this.isValid = event
  }

  private onChange(event: any) {
    this.changed = true
    this.$emit('change', event)
  }
}
</script>

<style scoped>

</style>
