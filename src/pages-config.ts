import { UserPageConfig } from '@/types/pages'

const pages: UserPageConfig[] = [
  {
    pageName: 'ExamplePage',
    component: () => import('@/pages/ExamplePage.vue'),
  },
  {
    pageName: 'ExamplePage2',
    component: () => import('@/pages/ExamplePage.vue'),
  }
]

export default pages
