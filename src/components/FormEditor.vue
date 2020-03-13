<template>
  <div>
    <FormModal
      v-model="formData"
      :form="form"
      @ok="onOk"
      ref="formModal"
      :key="formKey"
    />
    <SpinnerModal v-model="isLoading" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Table as TableElem } from '@/types/user'
import _ from 'lodash'

import FormModal from '@/components/FormModal.vue'
import SpinnerModal from '@/components/ui/SpinnerModal.vue'
import { userMapper } from '@/store/modules/user'
import { tableMapper } from '@/store/modules/table'
import { FormDescription } from '@/types/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem']),
  },
  methods: {
    ...tableMapper.mapActions(['addRecord', 'setRecordUpdate', 'fetchRecord']),
  },
})

@Component({
  components: { FormModal, SpinnerModal },
})
export default class FormEditor extends Mappers {
  private formData: any = {}
  private formKey: number = 0
  private isLoading: boolean = false
  private key?: string | number

  @Prop({ type: Object }) private form!: FormDescription
  @Prop({ type: Boolean, default: false }) private create!: boolean
  @Prop({ required: false }) private editKey?: number | string
  @Prop({ type: Number }) private tableId!: number

  public async show(key?: string | number) {
    this.key = key
    await this.setFormData()
    this.formKey++
    this.$nextTick(() => {
      const modal = this.$refs.formModal as any
      modal.show()
    })
  }

  private async setFormData() {
    if (!this.create) {
      this.isLoading = true
      const record = await this.fetchRecord({
        id: this.tableId,
        key: this.key,
      })
      this.formData = _.cloneDeep(record.data)
      this.isLoading = false
    } else {
      this.$set(this, 'formData', 0)
    }
  }

  private onOk() {
    const keyField = this.table.columns.find((col) => col.isPk)!.rowName
    const key = this.key
    if (this.create) {
      this.addRecord({ id: this.tableId, data: { ...this.formData } })
      this.$emit('created', key, { ...this.formData })
    } else {
      this.setRecordUpdate({ id: this.tableId, key, data: { ...this.formData } })
      this.$emit('updated', key, { ...this.formData })
    }
  }

  private get table(): TableElem {
    return this.hierarchyElem(this.tableId) as TableElem
  }
}
</script>
