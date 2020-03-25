import { Route } from 'vue-router'
import { Activation, Trigger } from '@/types/user'
import store from '@/store/index'

export default async function handleLogic(to: Route, from: Route, next: any) {
  const id = Number(to.params.id)
  const triggers = store.getters['user/triggers'](id)
  const onOpen = await Promise.all(
    triggers[Activation.open]?.map((trigger: Trigger) =>
      store.dispatch('logic/processCallScript', trigger.scriptId, {
        root: true,
      })
    ) || []
  )
  if (!onOpen.every((ret) => ret === true)) {
    next(false)
  } else {
    Promise.all(
      triggers[Activation.afterOpen]?.map((trigger: Trigger) =>
        store.dispatch('logic/processCallScript', trigger.scriptId, {
          root: true,
        })
      ) || []
    )
    next()
  }
}
