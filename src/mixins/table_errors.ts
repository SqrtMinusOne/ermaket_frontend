import { Component, Vue } from 'vue-property-decorator'
import { ValidationError } from '@/types/tables'

@Component
export default class TableErrors extends Vue {
  public getErrorsPopover(errors: ValidationError[]) {
    return {
      title: 'Errors',
      html: true,
      content: `<ul class="list_no_indent">
        ${errors.map((error) => `<li><b>[${error.rowName}]</b> ${error.message}</li>`)}
      </ul>`
    }
  }
}
