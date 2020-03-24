import { Criterion, Operator, Filter, Order } from '../types/tables'
import { AxiosPromise } from 'axios'
import { TableResponse, EntryResponse } from '@/types/tables'
import { http } from '@/axios-common'
import _ from 'lodash'

export default class TableAPI {
  public static get_table(
    table: string,
    schema: string,
    filterBy: Filter = [],
    offset: number = 0,
    limit: number = 10,
    order?: Order
  ) : AxiosPromise<TableResponse> {
    TableAPI.resolve_operators(filterBy)
    return http.get(`/tables/table/${schema}/${table}`, {
      params: {
        filter_by: JSON.stringify(filterBy),
        offset,
        limit,
        order_by: _.isNil(order) ? undefined : JSON.stringify(order)
      },
    })
  }

  public static get_entry(
    table: string,
    schema: string,
    filterBy: Filter = []
  ): AxiosPromise<EntryResponse> {
    TableAPI.resolve_operators(filterBy)
    return http.get(`/tables/entry/${schema}/${table}`, {
      params: {
        filter_by: JSON.stringify(filterBy),
      },
    })
  }

  private static resolve_criteria(criteria?: Criterion[]) {
    if (!criteria) {
      return
    }
    for (const criterion of criteria) {
      criterion.operator = Operator[criterion.operator as keyof typeof Operator]
    }
  }

  private static resolve_operators(filterBy: Filter) {
    if (Array.isArray(filterBy)) {
      TableAPI.resolve_criteria(filterBy)
    } else {
      TableAPI.resolve_criteria(filterBy.and)
      TableAPI.resolve_criteria(filterBy.or)
    }
  }
}
