<template>
  <b-modal
    header-bg-variant="primary"
    header-text-variant="light"
    ok-variant="primary"
    cancel-variant="outline-primary"
    title="Create registration token"
    v-bind="$attrs"
    ref="modal"
    @ok="onOk"
    @hide="onHide"
    :ok-disabled="!isOk"
  >
    <vue-form-generator
      :schema="schema"
      :model="model"
      :options="formOptions"
      @validated="onValidated"
    />
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { FormSchema, LinkedColumn, TableLinkType } from '@/types/user'
import { logicMapper } from '@/store/modules/logic'
import { userMapper } from '@/store/modules/user'

// tslint:disable-next-line:no-var-requires
const { validators } = require('vue-form-generator')

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['getTable']),
  },
  methods: {
    ...logicMapper.mapMutations(['onCloseModal']),
    ...userMapper.mapActions(['registrationToken']),
  },
})

function emptyModal() {
  return {
    name: 'Registration token',
    roles: [],
    uses: 1,
    time_limit: null,
  }
}

@Component
export default class RegistrationTokenModal extends Mappers {
  private model: {
    name: string
    roles?: string[]
    uses?: number
    timeLimit?: string
  } = emptyModal()

  private isValid: boolean = true

  private rolesColumn: LinkedColumn = {
    rowName: 'roles',
    text: 'roles',
    type: 'link',
    isSort: true,
    isFilter: true,
    isVisible: true,
    isEditable: true,
    isUnique: false,
    isPk: false,
    isRequired: false,
    isAuto: false,
    linkTableName: 'role',
    linkSchema: 'system',
    linkType: TableLinkType.linked,
    isMultiple: true,
    linkMultiple: true,
    linkRequired: false,
    linkName: 'Roles to register',
    default: []
  }

  private schema!: FormSchema

  private formOptions = {
    validateAfterChanged: true,
    validateAfterLoad: true,
  }

  public show() {
    this.model = emptyModal()
    ;(this.$refs.modal as any).show()
  }

  private created() {
    this.schema = {
      fields: [
        {
          type: 'input',
          inputType: 'text',
          model: 'name',
          label: 'Token name',
        },
        {
          type: 'linkedTableModal',
          column: this.rolesColumn,
          table: this.getTable('system', 'role')!,
          validator: validators.array,
          model: 'roles',
          label: 'Roles',
          required: false
        },
        {
          type: 'input',
          inputType: 'number',
          model: 'uses',
          label: 'Token uses',
          required: false
        },
        {
          type: 'datepicker',
          dateFormat: 'DD-MM-YYYY HH:mm:ss',
          required: false,
          model: 'time_limit',
          label: 'Time limit'
        }
      ],
    }
  }

  private onValidated(isValid: boolean) {
    this.isValid = isValid
  }

  private async onOk() {
    await this.registrationToken(this.model)
    this.onCloseModal()
  }

  private onHide() {
    this.onCloseModal()
  }

  private isOk() {
    return this.isValid
  }
}
</script>
