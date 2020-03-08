import { TableCreate, TableUpdate, ValidationInfo, DefaultInfo } from './tables'
import _ from 'lodash'

export function instanceOfTableUpdate(obj?: any): obj is TableUpdate {
  return obj ? 'oldData' in obj && 'newData' in obj : false
}

export function instanceOfValidationInfo(obj?: any): obj is ValidationInfo {
  return (
    _.isObject(obj) && !_.isEmpty(obj) &&
    Object.values(obj).every(
      (val) => _.isArray(val) && val.every((entry) => _.isString(entry))
    )
  )
}

export function instanceOfDefaultInfo(obj: any): obj is DefaultInfo {
  return _.isString(obj)
}
