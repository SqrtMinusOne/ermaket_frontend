import { Component, Vue } from 'vue-property-decorator'
import { ValidationError, ErrorSeverity } from '@/types/tables'
import _ from 'lodash'

@Component
export default class TableErrors extends Vue {
  public getErrorsPopover(errors: ValidationError[]) {
    let content = ''
    const sErrors = errors.filter((err) => err.severity ===  ErrorSeverity.error)
    const sWarnings = errors.filter((err) => err.severity === ErrorSeverity.warning)
    if (!_.isEmpty(sErrors)) {
      content += `
        Errors:
        ${this.getList(sErrors)}
      `
    }
    if (!_.isEmpty(sWarnings)) {
      content += `
        Warnings:
        ${this.getList(sWarnings)}
      `
    }

    return {
      title: 'Problems',
      html: true,
      content,
    }
  }

  private getList(errors: ValidationError[]) {
    return `
      <ul class="list_no_indent">
        ${errors
          .map(
            (error) => `<li><b>[${error.rowName}]</b> ${error.message}</li>`
          ).join('')}
      </ul>
    `
  }
}
