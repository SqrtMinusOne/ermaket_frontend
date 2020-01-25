import { Criterion, Operator, Filter, Order } from '../types/tables'
import { AxiosPromise } from 'axios'
import { TableResponse } from '@/types/tables'
import { http } from '@/axios-common'

export default class TableAPI {
  public static get_table(
    table: string,
    schema: string,
    filterBy: Filter = [],
    offset: number = 0,
    limit: number = 10,
    order: Order = []
  ) : AxiosPromise<TableResponse> {
    return http.get(`/tables/table/${schema}/${table}`, {
      params: {
        filter_by: JSON.stringify(filterBy),
        offset,
        limit,
        order_by: JSON.stringify(order),
      },
    })
  }

  public static get_entry(
    table: string,
    schema: string,
    filterBy: Filter = []
  ) {
    return http.get(`/tables/entry/${schema}/${table}`, {
      params: {
        filter_by: JSON.stringify(filterBy),
      },
    })
  }
}
