import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounceSearch } from './useDebounceSearch'

describe('useDebounceSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial search term', () => {
    const { result } = renderHook(() => useDebounceSearch())
    expect(result.current.searchTerm).toBe('')
    expect(result.current.debouncedSearch).toBe('')
  })

  it('returns custom initial value', () => {
    const { result } = renderHook(() => useDebounceSearch({ initialValue: 'test' }))
    expect(result.current.searchTerm).toBe('test')
    expect(result.current.debouncedSearch).toBe('test')
  })

  it('updates searchTerm immediately', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 300 }))
    
    act(() => {
      result.current.setSearchTerm('hello')
    })
    
    expect(result.current.searchTerm).toBe('hello')
    expect(result.current.debouncedSearch).toBe('')
  })

  it('updates debouncedSearch after delay', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 300 }))
    
    act(() => {
      result.current.setSearchTerm('hello')
    })
    
    expect(result.current.debouncedSearch).toBe('')
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.debouncedSearch).toBe('hello')
  })

  it('resets debounced search when search term is cleared', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 300 }))
    
    act(() => {
      result.current.setSearchTerm('hello')
    })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.debouncedSearch).toBe('hello')
    
    act(() => {
      result.current.setSearchTerm('')
    })
    expect(result.current.searchTerm).toBe('')
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.debouncedSearch).toBe('')
  })

  it('clearSearch clears both searchTerm and debouncedSearch', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 300 }))
    
    act(() => {
      result.current.setSearchTerm('test query')
    })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.searchTerm).toBe('test query')
    expect(result.current.debouncedSearch).toBe('test query')
    
    act(() => {
      result.current.clearSearch()
    })
    
    expect(result.current.searchTerm).toBe('')
    expect(result.current.debouncedSearch).toBe('')
  })

  it('uses custom delay', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 500 }))
    
    act(() => {
      result.current.setSearchTerm('test')
    })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.debouncedSearch).toBe('')
    
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.debouncedSearch).toBe('test')
  })

  it('debounces rapid changes', () => {
    const { result } = renderHook(() => useDebounceSearch({ delay: 300 }))
    
    act(() => {
      result.current.setSearchTerm('a')
    })
    act(() => {
      result.current.setSearchTerm('ab')
    })
    act(() => {
      result.current.setSearchTerm('abc')
    })
    
    expect(result.current.searchTerm).toBe('abc')
    expect(result.current.debouncedSearch).toBe('')
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.debouncedSearch).toBe('abc')
  })
})