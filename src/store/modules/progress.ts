import {
  Getters,
  Mutations,
  Actions,
  Module,
  createMapper,
} from 'vuex-smart-module'

/* tslint:disable:max-classes-per-file */

class ProgressState {
  public enqueued: number = 0
  public processed: number = 0
}

class ProgressGetters extends Getters<ProgressState> {
  public get showProgress() {
    return this.state.enqueued !== this.state.processed
  }
}

class ProgressMutations extends Mutations<ProgressState> {
  public enqueue() {
    this.state.enqueued += 1
    console.log(JSON.stringify(this.state))
  }

  public dequeue() {
    this.state.processed += 1
    if (this.state.enqueued <= this.state.processed) {
      this.state.enqueued = this.state.processed = 0
    }
    console.log(JSON.stringify(this.state))
  }
}

export const progress = new Module({
  state: ProgressState,
  getters: ProgressGetters,
  mutations: ProgressMutations
})

export const progressMapper = createMapper(progress)
