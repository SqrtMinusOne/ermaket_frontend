import axios, { AxiosInstance } from 'axios'

const baseURL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000'

export const http: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const store = require('@/store/index').default
  store.commit('progress/enqueue', null, { root: true })
  return config
})

http.interceptors.response.use(
  (response) => {
    const store = require('@/store/index').default
    store.commit('progress/dequeue', null, { root: true })
    return response
  },
  (error) => {
    const store = require('@/store/index').default
    store.commit('progress/dequeue', null, { root: true })
    return Promise.reject(error)
  }
)
