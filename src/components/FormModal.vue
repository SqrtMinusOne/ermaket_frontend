<template>
  <b-modal
    header-bg-variant="primary"
    header-text-variant="light"
    ok-variant="primary"
    cancel-variant="outline-primary"
    title="Add record"
    v-bind="$attrs"
    ref="modal"
    @ok="$emit('ok')"
    @cancel="$emit('cancel')"
    >
    <Form :formData="formData" @change="onChange" :form="form" />
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

  public show() {
    console.log(this.formData)
    const modal = this.$refs.modal as any
    modal.show()
  }

  private onChange(event: any) {
    this.$emit('change', event)
  }
}
</script>

<style scoped>

</style>
