import { describe, it, expect } from 'vitest'
import {
  getStateLabel,
  getStateStyle,
  formatAreaLabel,
  getStockStyle,
  formatCurrency,
  formatDate,
} from './toolUtils'

describe('toolUtils', () => {
  describe('getStateLabel', () => {
    it('returns "Nuevo" for nuevo state', () => {
      expect(getStateLabel('nuevo')).toBe('Nuevo')
    })

    it('returns "Buen estado" for buen estado', () => {
      expect(getStateLabel('buen estado')).toBe('Buen estado')
    })

    it('returns "Regular" for regular state', () => {
      expect(getStateLabel('regular')).toBe('Regular')
    })

    it('returns "Mal estado" for mal estado', () => {
      expect(getStateLabel('mal estado')).toBe('Mal estado')
    })

    it('returns "Obsoleto" for obsoleto state', () => {
      expect(getStateLabel('obsoleto')).toBe('Obsoleto')
    })

    it('returns "Perdida" for perdida state', () => {
      expect(getStateLabel('perdida')).toBe('Perdida')
    })

    it('returns unknown state as-is', () => {
      expect(getStateLabel('unknown-state')).toBe('unknown-state')
    })
  })

  describe('getStateStyle', () => {
    it('returns blue background for nuevo', () => {
      const style = getStateStyle('nuevo')
      expect(style).toContain('bg-blue-500')
      expect(style).toContain('text-white')
    })

    it('returns emerald for buen estado', () => {
      const style = getStateStyle('buen estado')
      expect(style).toContain('bg-emerald-500')
      expect(style).toContain('text-white')
    })

    it('returns amber for regular', () => {
      const style = getStateStyle('regular')
      expect(style).toContain('bg-amber-600')
      expect(style).toContain('text-white')
    })

    it('returns orange for mal estado', () => {
      const style = getStateStyle('mal estado')
      expect(style).toContain('bg-orange-500')
      expect(style).toContain('text-white')
    })

    it('returns slate for obsoleto', () => {
      const style = getStateStyle('obsoleto')
      expect(style).toContain('bg-slate-500')
      expect(style).toContain('text-white')
    })

    it('returns red for perdida', () => {
      const style = getStateStyle('perdida')
      expect(style).toContain('bg-red-500')
      expect(style).toContain('text-white')
    })

    it('returns default style for unknown state', () => {
      const style = getStateStyle('unknown')
      expect(style).toContain('bg-slate-100')
      expect(style).toContain('text-slate-600')
    })
  })

  describe('formatAreaLabel', () => {
    it('converts montaje/desmontaje to Montaje/Desmontaje', () => {
      expect(formatAreaLabel('montaje/desmontaje')).toBe('Montaje/Desmontaje')
    })

    it('converts armado/desarmado to Armado/Desarmado', () => {
      expect(formatAreaLabel('armado/desarmado')).toBe('Armado/Desarmado')
    })

    it('returns unknown area as-is', () => {
      expect(formatAreaLabel('otra-area')).toBe('otra-area')
    })
  })

  describe('getStockStyle', () => {
    it('returns "Sin stock" with red style when quantity is 0', () => {
      const result = getStockStyle(0)
      expect(result.label).toBe('Sin stock')
      expect(result.className).toBe('text-red-600')
      expect(result.dotClassName).toBe('bg-red-500')
    })

    it('returns "X disponibles" with green style when quantity > 0', () => {
      const result = getStockStyle(5)
      expect(result.label).toBe('5 disponibles')
      expect(result.className).toBe('text-emerald-600')
      expect(result.dotClassName).toBe('bg-emerald-500')
    })

    it('returns correct count for different quantities', () => {
      expect(getStockStyle(1).label).toBe('1 disponibles')
      expect(getStockStyle(100).label).toBe('100 disponibles')
    })
  })

  describe('formatCurrency', () => {
    it('formats 0 as MXN currency', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats positive numbers as MXN currency', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats large numbers with comma separators', () => {
      expect(formatCurrency(10000)).toBe('$10,000.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('returns "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('returns "-" for empty string', () => {
      expect(formatDate('')).toBe('-')
    })

    it('formats date string to Spanish short format', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('ene')
      expect(result).toContain('2024')
    })

    it('formats different dates correctly', () => {
      expect(formatDate('2024-12-25')).toContain('dic')
      expect(formatDate('2024-06-15')).toContain('jun')
    })
  })
})