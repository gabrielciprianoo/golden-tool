import axios, { AxiosError, type AxiosInstance } from 'axios'
import type { ApiError, ApiResult, RequestConfig } from '../types/api'


const API_BASE_URL = import.meta.env.VITE_API_URL



const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/
export async function get<T>(url: string, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.get<T>(url, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/
export async function post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.post<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/
export async function put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.put<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
*/
export async function patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.patch<T>(url, data, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
export async function del<T>(url: string, config?: RequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.delete<T>(url, config)
    return { success: true, data: response.data }
  } catch (error) {
    return handleError(error)
  }
}

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/
function handleError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error de conexión',
      statusCode: error.response?.status || 500,
      details: error.response?.data,
    }
  }

  return {
    success: false,
    error: 'Error desconocido',
    statusCode: 500,

  }
  
}



export default apiClient