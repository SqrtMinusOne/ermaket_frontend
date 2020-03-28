<template>
  <div>
    <Navbar />
    <b-container fluid>
      <b-row align-h="center" align-v="center" class="mt-3">
        <b-col sm="12" md="6">
          <SignUpForm />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import SignUpForm from '@/components/SignUpForm.vue'
import Navbar from '@/components/Navbar.vue'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['isLoggedIn']),
  },
  methods: {
    ...userMapper.mapActions(['logout']),
  },
})

@Component({
  components: { SignUpForm, Navbar },
})
export default class SignUp extends Mappers {
  @Watch('isLoggedIn')
  private onLoggedIn() {
    if (this.isLoggedIn) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped></style>
