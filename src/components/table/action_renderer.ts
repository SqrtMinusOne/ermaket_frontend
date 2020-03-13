import { Component, Vue, Mixins } from 'vue-property-decorator'
import { ICellRendererParams } from 'ag-grid-community'
import { tableMapper } from '@/store/modules/table'
import { userMapper } from '@/store/modules/user'
import TableErrors from '@/mixins/table_errors'
import { Column, Access, Table } from '@/types/user'

interface Params extends ICellRendererParams {
  [key: string]: any
}

const Mappers = Mixins(TableErrors).extend({
  computed: {
    ...tableMapper.mapState(['errors']),
    ...userMapper.mapGetters(['getTable']),
    ...tableMapper.mapGetters(['isTransactee', 'isToDelete', 'hasErrors', 'hasInfo', 'getError', 'isToCreate']),
  },
  methods: {
    ...tableMapper.mapActions(['fetchRecord', 'setDelete', 'revert']),
  },
})

@Component({
  template: `<span>
    <b-button v-if="showErrors"
      v-b-popover.hover.noninteractive="errorPopover"
      variant="primary"
    >
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" v-if="isError" />
      <font-awesome-icon :icon="['fas', 'info']" v-else />
    </b-button>
    <b-button v-if="canRevert"
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Revert changes"
      @click="onRevert"
    >
      <font-awesome-icon :icon="['fas', 'history']" />
    </b-button>
    <b-button v-if="canUnlink"
      variant="primary"
      v-b-tooltip.noninteractive
      title="Remove the link"
      @click="onUnlink"
    >
      <font-awesome-icon :icon="['fas', 'minus-square']" />
    </b-button>
    <b-button v-if="canEdit"
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Edit the entry in the form"
      @click="onEdit"
    >
      <font-awesome-icon :icon="['fas', 'pen']" />
    </b-button>
    <b-button v-if="canDelete && !isCreate"
      variant="primary"
      v-b-tooltip.hover.noninteractive
      title="Mark the entry for deletion"
      @click="onDelete"
    >
      <font-awesome-icon :icon="['fas', 'times']" />
    </b-button>
  </span>`,
})
export default class ActionRenderer extends Mappers {
  private params!: Params
  private getErrorsPopover!: any

  private onDelete() {
    this.setDelete({ id: this.table.id, key: this.key })
    if (this.params.context.parent.getLinked(this.key)) {
      this.params.context.parent.onLinkedClose(this.key)
    } else {
      this.params.api.redrawRows({ rowNodes: [this.params.node] })
    }
    this.params.context.parent.onUpdate()
  }

  private async onRevert() {
    const wasCreated = this.isToCreate(this.table.id, this.key)
    const filterModel = this.params.api.getFilterModel()
    const sortModel = this.params.api.getSortModel()
    const { row } = (await this.revert({
      id: this.table.id,
      key: this.key,
      index: this.params.data._index,
    })) as any
    if (row) {
      this.params.node.setData({
        ...this.params.data,
        ...row,
      })
    }
    if (this.params.context.parent.getLinked(this.key)) {
      this.params.context.parent.onLinkedClose(this.key)
    } else if (!wasCreated) {
      this.params.api.redrawRows({ rowNodes: [this.params.node] })
    } else {
      this.params.context.parent.update()
    }
    this.params.context.parent.onUpdate()
    this.$nextTick(() => {
      this.params.api.setFilterModel(filterModel)
      this.params.api.setSortModel(sortModel)
    })
  }

  private onUnlink() {
    this.params.context.parent.onKeySet(this.key, false)
    this.params.context.parent.update()
  }

  private onEdit() {
    this.params.context.parent.onFormEdit(this.key, this.params.node)
  }

  private get showErrors() {
    return this.hasInfo(this.table.id, this.key)
  }

  private get isError(){
    return this.hasErrors(this.table.id, this.key)
  }

  private get isCreate() {
    return this.isToCreate(this.table.id, this.key)
  }

  private get errorPopover() {
    return this.getErrorsPopover(this.getError(this.table.id, this.key))
  }

  private get canUnlink() {
    return this.params.isLinked
  }

  private get table() {
    return this.params.table as Table
  }

  private get canDelete() {
    return (
      this.params.data &&
      !this.params.noDelete &&
      this.table.userAccess.has(Access.delete) &&
      !this.isToDelete(this.table.id, this.key)
    )
  }

  private get canEdit() {
    return (
      this.params.data &&
      this.table.userAccess.has(Access.change)
    )
  }

  private get canRevert() {
    return (
      this.params.data &&
      !this.params.noRevert &&
      this.isTransactee(this.table.id, this.key)
    )
  }

  private get key() {
    return this.params.data[this.pk.rowName]
  }

  private get pk() {
    return this.params.pk as Column
  }
}
