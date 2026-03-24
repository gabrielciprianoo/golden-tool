import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError, ApiResult, RequestConfig } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function get<T>(url: string, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.get<T>(url, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

export async function post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.post<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

export async function put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.put<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

export async function patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.patch<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

export async function del<T>(url: string, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.delete<T>(url, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

function handleError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500
    const message = error.response?.data?.error || error.message || 'Error de conexión'
    return {
      success: false,
      error: message,
      statusCode,
      details: error.response?.data?.details,
    }
  }
  return {
    success: false,
    error: 'Error desconocido',
    statusCode: 500,
  }
}

export default apiClient
