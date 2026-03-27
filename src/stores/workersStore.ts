import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Worker, CreateWorkerInput, WorkerArea } from '../types/worker'

interface WorkersState {
  workers: Worker[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  filterArea: WorkerArea | ''
  fetchWorkers: () => Promise<void>
  addWorker: (data: CreateWorkerInput) => Promise<boolean>
  updateWorker: (id: string, data: CreateWorkerInput) => Promise<boolean>
  deleteWorker: (id: string) => Promise<boolean>
  getNextCode: () => string
  setSearchTerm: (term: string) => void
  setFilterArea: (area: WorkerArea | '') => void
  getFilteredWorkers: () => Worker[]
  clearFilters: () => void
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
      searchTerm: '',
      filterArea: '',

      getNextCode: () => {
        const count = get().workers.length
        return generateCode(count)
      },

      setSearchTerm: (term: string) => set({ searchTerm: term }),
      
      setFilterArea: (area: WorkerArea | '') => set({ filterArea: area }),

      clearFilters: () => set({ searchTerm: '', filterArea: '' }),

      getFilteredWorkers: () => {
        const { workers, searchTerm, filterArea } = get()
        const term = searchTerm.toLowerCase().trim()

        return workers.filter((worker) => {
          const matchesSearch = !term || 
            worker.name.toLowerCase().includes(term) ||
            worker.lastName.toLowerCase().includes(term) ||
            worker.code.toLowerCase().includes(term)

          const matchesArea = !filterArea || worker.area === filterArea

          return matchesSearch && matchesArea
        })
      },

      fetchWorkers: async () => {
        set({ isLoading: true, error: null })
        try {
          set({ isLoading: false })
        } catch {
          set({ error: 'Error al cargar trabajadores', isLoading: false })
        }
      },

      addWorker: async (data: CreateWorkerInput) => {
        set({ isLoading: true, error: null })
        try {
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

      updateWorker: async (id: string, data: CreateWorkerInput) => {
        set({ isLoading: true, error: null })
        try {
          const workers = get().workers.map((w) =>
            w.id === id
              ? { ...w, name: data.name, lastName: data.lastName, area: data.area }
              : w
          )
          set({ workers, isLoading: false })
          return true
        } catch {
          set({ error: 'Error al actualizar trabajador', isLoading: false })
          return false
        }
      },

      deleteWorker: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
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
