import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns single class name', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('combines multiple string arguments', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('handles conditional strings with boolean', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles arrays of strings', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, 0, '')).toBe('foo')
  })

  it('handles objects with truthy values', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })

  it('handles mixed arguments', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true }, false && 'quux')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
    expect(result).toContain('baz')
    expect(result).toContain('qux')
    expect(result).not.toContain('quux')
  })

  it('handles className strings from classnames library pattern', () => {
    const isActive = true
    const isDisabled = false
    const result = cn('base-class', isActive && 'active', isDisabled && 'disabled')
    expect(result).toBe('base-class active')
  })
})