import { AxiosPromise } from 'axios'
import { DefaultResponse } from '@/types/user'
import { Transaction } from '@/types/tables'
import { http } from '@/axios-common'

export default class TransactionAPI {
  public static sendTransaction(
    transaction: Transaction
  ): AxiosPromise<DefaultResponse> {
    return http.post('/transaction/execute', { transaction })
  }
}
