import { Criterion, Operator, Filter, Order } from '../types/tables'
import { http } from '@/axios-common'

export default class TableAPI {
  public static get_table(
    table: string,
    schema: string,
    filterBy: Filter = [],
    page: number = 0,
    perPage: number = 10,
    order: Order = []
  ) {
    return http.get(`/tables/table/${schema}/${table}`, {
      params: {
        filter_by: JSON.stringify(filterBy),
        page,
        per_page: perPage,
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
