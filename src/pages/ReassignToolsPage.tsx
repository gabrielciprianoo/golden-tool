import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useTools } from '../hooks/useTools'
import { useWorkers } from '../hooks/useWorkers'
import { useToastStore } from '../stores/toastStore'
import api from '../services/apiClient'

interface Assignment {
  id: number
  worker_id: number
  tool_id: number
  assigned_quantity: number
  state: string
}

export const ReassignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()

  const { data: workers = [] } = useWorkers()
  const { tools = [], refetch } = useTools()
  const { addToast } = useToastStore()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  const worker = workers.find((w) => w.id === Number(workerId))

  // 🔥 CARGAR ASIGNACIONES (SIN LOOP)
  useEffect(() => {
  const fetchAssignments = async () => {
    try {
      const res = await api.get('/asignations')

      const filtered = res.data.data.filter(
        (a: Assignment) => a.worker_id === Number(workerId)
      )

      setAssignments(filtered)

    } catch (error) {
      console.error(error)
      addToast('Error al cargar asignaciones', 'error')

    } finally {
      setLoading(false) 
    }
  }

  fetchAssignments()
}, [workerId])

  // 🔥 MAPEAR herramientas con asignaciones
  const assignedTools = useMemo(() => {
    return assignments.map((a) => {
      const tool = tools.find((t) => Number(t.id) === a.tool_id)

      return {
        ...a,
        toolName: tool?.name || 'Herramienta desconocida',
      }
    })
  }, [assignments, tools])

  // 🔥 ELIMINAR ASIGNACIÓN
  const handleRemove = async (id: number) => {
    if (!confirm('¿Quitar esta herramienta?')) return

    try {
      await api.delete(`/asignations/${id}`)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
      addToast('Herramienta removida', 'success')
      refetch()
    } catch (error) {
      console.error(error)
      addToast('Error al eliminar', 'error')
    }
  }

  if (!worker) {
    return (
      <div className="admin-module">
        <ToastContainer />
        <p>Trabajador no encontrado</p>
      </div>
    )
  }

  return (
    <div className="admin-module">
      <ToastContainer />

      {/* HEADER */}
      <div className="mb-6">
        <Button onClick={() => navigate('/admin/workers')}>
          ← Volver
        </Button>
      </div>

      {/* INFO TRABAJADOR */}
      <div className="bg-[var(--bg)] border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Reasignar Herramientas</h2>
        <p>
          {worker.name} {worker.lastname}
        </p>
      </div>

      {/* LISTA */}
      <div className="bg-[var(--bg)] border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Herramientas asignadas
        </h3>

        {loading ? (
          <p>Cargando...</p>
        ) : assignedTools.length === 0 ? (
          <p>No tiene herramientas asignadas</p>
        ) : (
          <div className="space-y-3">
            {assignedTools.map((tool) => (
              <div
                key={tool.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{tool.toolName}</p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {tool.assigned_quantity} | Estado: {tool.state}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleRemove(tool.id)}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACCIONES */}
      <div className="flex justify-end mt-6">
        <Button onClick={() => navigate(`/admin/workers/assign/${workerId}`)}>
          + Asignar más herramientas
        </Button>
      </div>
    </div>
  )
}