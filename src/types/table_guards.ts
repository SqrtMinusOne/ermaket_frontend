import { TableCreate, TableUpdate } from './tables'

export function instanceOfTableUpdate(obj?: any): obj is TableUpdate {
  return obj ? 'oldData' in obj && 'newData' in obj : false
}
