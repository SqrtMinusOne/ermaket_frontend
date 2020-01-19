import axios, { AxiosInstance } from 'axios'

const baseURL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000'

export const http: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true
})
