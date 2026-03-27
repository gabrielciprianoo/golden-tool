import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Worker, CreateWorkerInput } from '../types/worker'

interface WorkersState {
  workers: Worker[]
  isLoading: boolean
  error: string | null
  fetchWorkers: () => Promise<void>
  addWorker: (data: CreateWorkerInput) => Promise<boolean>
  deleteWorker: (id: string) => Promise<boolean>
  getNextCode: () => string
}

const generateCode = (count: number): string => {
  const num = count + 1
  return `TRB-${num.toString().padStart(3, '0')}`
}

export const useWorkersStore = create<WorkersState>()(
  persist(
    (set, get) => ({
      workers: [],
      isLoading: false,
      error: null,

      getNextCode: () => {
        const count = get().workers.length
        return generateCode(count)
      },

      fetchWorkers: async () => {
        set({ isLoading: true, error: null })
        try {
          // Simular llamada API (pendiente de backend)
          // const response = await workerService.getAll()
          // if (response.success) set({ workers: response.data })
          
          set({ isLoading: false })
        } catch {
          set({ error: 'Error al cargar trabajadores', isLoading: false })
        }
      },

      addWorker: async (data: CreateWorkerInput) => {
        set({ isLoading: true, error: null })
        try {
          // Simular llamada API (pendiente de backend)
          // const response = await workerService.create(data)
          // if (response.success) { ... }

          const workers = get().workers
          const newWorker: Worker = {
            id: crypto.randomUUID(),
            code: generateCode(workers.length),
            name: data.name,
            lastName: data.lastName,
            area: data.area,
            createdAt: new Date().toISOString(),
          }

          set({ workers: [...workers, newWorker], isLoading: false })
          return true
        } catch {
          set({ error: 'Error al registrar trabajador', isLoading: false })
          return false
        }
      },

      deleteWorker: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          // Simular llamada API (pendiente de backend)
          // await workerService.delete(id)

          const workers = get().workers.filter((w) => w.id !== id)
          set({ workers, isLoading: false })
          return true
        } catch {
          set({ error: 'Error al eliminar trabajador', isLoading: false })
          return false
        }
      },
    }),
    {
      name: 'workers-storage',
      partialize: (state) => ({ workers: state.workers }),
    }
  )
)
