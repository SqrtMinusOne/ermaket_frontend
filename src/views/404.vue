<template>
  <main-card name="Error 404">
    This page does not exist
  </main-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MainCard from '@/components/ui/MainCard.vue'

@Component({ components: { MainCard } })
export default class Error404 extends Vue {

}

</script>

<style scoped>

</style>
