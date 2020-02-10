import { Component, Mixins, Vue } from 'vue-property-decorator'
import { Access } from '@/types/user'
import { userMapper } from '@/store/modules/user'

const Mappers = Vue.extend({
  computed: {
    ...userMapper.mapGetters(['hierarchyElem'])
  }
})

@Component
export default class AccessBreakdown extends Mappers {
  public getRightsHtml(id: number) {
    const elem = this.hierarchyElem(id)!
    let content = `You have the following <b>access rights</b> for the <b>${elem.name}</b>:`
    content += '<ul class="list_no_indent">'

    if (elem.userAccess.has(Access.view)) {
      content += '<li> <i class="fas fa-eye"></i> Read </li>'
    }

    if (elem.userAccess.has(Access.change)) {
      content += '<li> <i class="fas fa-pencil-alt"></i> Change </li>'
    }

    if (elem.userAccess.has(Access.delete)) {
      content += '<li> <i class="fas fa-times"></i> Delete </li>'
    }
    content += '</ul>'

    return content
  }
}
