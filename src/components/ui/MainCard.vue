<template>
  <div :class="{'d-flex': !noflex, 'flex-column': !noflex, 'flex-fill': !noflex}">
    <b-card
      border-variant="primary"
      header-bg-variant="primary"
      header-text-variant="white"
      header-class="small_card_header"
      no-body
    >
    <template v-slot:header>
      <div class="d-flex flex-row align-items-center">
        <b>{{ name }}</b>
        <div class="ml-auto" style="height: 32px">
          <slot name="controls" />
        </div>
      </div>
    </template>
    <slot></slot>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class MainCard extends Vue {
  @Prop({ type: String, required: true }) private readonly name!: string
  @Prop({ type: Boolean, default: false }) private readonly noflex!: boolean
}

</script>
