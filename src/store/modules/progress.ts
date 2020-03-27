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
  public errors: number = 0
}

class ProgressGetters extends Getters<ProgressState> {
  public get showProgress() {
    return this.state.enqueued !== this.state.processed
  }
}

class ProgressMutations extends Mutations<ProgressState> {
  public enqueue() {
    this.state.enqueued += 1
  }

  public dequeue(ok: boolean = true) {
   this.state.processed += 1
    if (!ok) {
      this.state.errors += 1
    }
    if (this.state.enqueued <= this.state.processed) {
      this.state.enqueued = this.state.processed = this.state.errors = 0
    }
  }

  public reset() {
    const s: any = new ProgressState()
    Object.keys(s).forEach((key: any) => {
      ;(this.state as any)[key] = s[key]
    })
  }

}

export const progress = new Module({
  state: ProgressState,
  getters: ProgressGetters,
  mutations: ProgressMutations
})

export const progressMapper = createMapper(progress)
