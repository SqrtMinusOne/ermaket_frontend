<template>
  <b-modal
    header-bg-variant="primary"
    header-text-variant="light"
    title="Loading"
    v-bind="$attrs"
    ref="modal"
    hide-footer
    centered
  >
    <div class="d-flex flex-row align-items-center">
      <b-spinner variant="primary" class="mr-2" />
      <div>Please wait</div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SpinnerModal extends Vue {}
</script>
