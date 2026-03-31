import { useState, useCallback } from 'react'
import type { ApiResult, ApiError } from '../types/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<ApiResult<T>>
  reset: () => void
}

export function useApi<T>(apiFn: (...args: unknown[]) => Promise<ApiResult<T>>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: unknown[]): Promise<ApiResult<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await apiFn(...args)

      if (result.success) {
        setState({ data: result.data as T, loading: false, error: null })
      } else {
        setState({ data: null, loading: false, error: result as ApiError })
      }

      return result
    },
    [apiFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
