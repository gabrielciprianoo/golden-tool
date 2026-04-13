import { useState, useEffect, useCallback } from 'react'

interface UseDebounceSearchOptions {
  delay?: number
  initialValue?: string
}

interface UseDebounceSearchReturn {
  searchTerm: string
  debouncedSearch: string
  setSearchTerm: (value: string) => void
  clearSearch: () => void
}

export const useDebounceSearch = (
  options: UseDebounceSearchOptions = {}
): UseDebounceSearchReturn => {
  const { delay = 300, initialValue = '' } = options
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearch('')
  }, [])

  return {
    searchTerm,
    debouncedSearch,
    setSearchTerm,
    clearSearch,
  }
}

export default useDebounceSearch