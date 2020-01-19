<template>
  <b-container fluid>
    <b-row align-h="center" align-v="center">
      <b-col sm="12" md="6">
        <LoginForm />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LoginForm from '@/components/LoginForm.vue'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
  },
  methods: {
    ...userMapper.mapActions({
      logout: 'logout',
    }),
  },
})

@Component({
  components: { LoginForm },
})
export default class Login extends Mappers {
  @Watch('isLoggedIn')
  onLoggedIn() {
    if (this.isLoggedIn) {
      this.$router.push('/home')
    }
  }
}

</script>

<style scoped>

</style>
