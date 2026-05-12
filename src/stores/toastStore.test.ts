import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from './toastStore'

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('debe tener estado inicial vacío', () => {
    const { toasts } = useToastStore.getState()
    expect(toasts).toEqual([])
  })

  it('debe agregar un toast', () => {
    const { addToast } = useToastStore.getState()
    addToast('Mensaje de prueba', 'success')
    const { toasts } = useToastStore.getState()
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('Mensaje de prueba')
    expect(toasts[0].type).toBe('success')
  })

  it('debe eliminar un toast por id', () => {
    const { addToast, removeToast } = useToastStore.getState()
    addToast('Mensaje de prueba', 'success')
    const { toasts } = useToastStore.getState()
    const toastId = toasts[0].id
    
    removeToast(toastId)
    const { toasts: afterRemove } = useToastStore.getState()
    expect(afterRemove.length).toBe(0)
  })

  it('debe soportar diferentes tipos de toast', () => {
    const { addToast } = useToastStore.getState()
    
    addToast('Mensaje error', 'error')
    addToast('Mensaje warning', 'warning')
    addToast('Mensaje info', 'info')
    
    const { toasts } = useToastStore.getState()
    expect(toasts.length).toBe(3)
    expect(toasts.map(t => t.type)).toEqual(['error', 'warning', 'info'])
  })
})