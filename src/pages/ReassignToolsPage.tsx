import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useToastStore } from '../stores/toastStore'
import api from '../services/apiClient'

interface Assignment {
  id: number
  tool_id: number
  worker_id: number
  assigned_quantity: number
  state: string
  tool?: {
    name: string
  }
}

export const ReassignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { addToast } = useToastStore()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  
  const [removeQty, setRemoveQty] = useState<Record<number, number>>({})

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/asignations')

        const data = res.data.data || []

        const filtered = data.filter(
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

  // 🟢 Quitar 1
  const handleRemoveOne = async (assignment: Assignment) => {
    try {
      if (assignment.assigned_quantity > 1) {
        await api.put(`/asignations/${assignment.id}`, {
          assigned_quantity: assignment.assigned_quantity - 1,
        })

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignment.id
              ? { ...a, assigned_quantity: a.assigned_quantity - 1 }
              : a
          )
        )
      } else {
        await api.delete(`/asignations/${assignment.id}`)

        setAssignments((prev) =>
          prev.filter((a) => a.id !== assignment.id)
        )
      }

      addToast('Cantidad actualizada', 'success')
    } catch (error) {
      console.error(error)
      addToast('Error al actualizar', 'error')
    }
  }

  // 🟡 Quitar cantidad personalizada
  const handleRemoveQuantity = async (assignment: Assignment) => {
    const qty = removeQty[assignment.id] || 1

    try {
      if (qty >= assignment.assigned_quantity) {
        await api.delete(`/asignations/${assignment.id}`)

        setAssignments((prev) =>
          prev.filter((a) => a.id !== assignment.id)
        )
      } else {
        await api.put(`/asignations/${assignment.id}`, {
          assigned_quantity: assignment.assigned_quantity - qty,
        })

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignment.id
              ? {
                  ...a,
                  assigned_quantity:
                    a.assigned_quantity - qty,
                }
              : a
          )
        )
      }

      addToast('Cantidad actualizada', 'success')
    } catch (error) {
      console.error(error)
      addToast('Error al actualizar', 'error')
    }
  }

  if (loading) {
    return (
      <div className="admin-module">
        <p className="text-center py-10">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/workers')}
        >
          ← Volver
        </Button>
      </div>

      <h2 className="text-xl font-bold mb-6">
        Reasignar herramientas
      </h2>

      {assignments.length === 0 ? (
        <p className="text-center">No hay herramientas asignadas</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((tool) => (
            <div
              key={tool.id}
              className="p-4 border rounded-xl bg-[var(--bg)] shadow-sm"
            >
              <div className="flex justify-between items-center flex-wrap gap-4">
                {/* INFO */}
                <div>
                  <p className="font-semibold text-lg">
                    {tool.tool?.name || `Herramienta #${tool.tool_id}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cantidad actual: {tool.assigned_quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Estado: {tool.state}
                  </p>
                </div>

                {/* CONTROLES */}
                <div className="flex flex-col gap-2">

                  {/* 🔥 Quitar 1 */}
                  <Button
                    size="sm"
                    onClick={() => handleRemoveOne(tool)}
                  >
                    -1
                  </Button>

                  {/* 🔥 Input cantidad */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={tool.assigned_quantity}
                      value={removeQty[tool.id] || 1}
                      onChange={(e) =>
                        setRemoveQty((prev) => ({
                          ...prev,
                          [tool.id]: Number(e.target.value),
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveQuantity(tool)}
                    >
                      Quitar
                    </Button>
                  </div>

                  {/* 🔴 Eliminar todo */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await api.delete(`/asignations/${tool.id}`)

                        setAssignments((prev) =>
                          prev.filter((a) => a.id !== tool.id)
                        )

                        addToast('Herramienta eliminada', 'success')
                      } catch (error) {
                        console.error(error)
                        addToast('Error al eliminar', 'error')
                      }
                    }}
                  >
                    Eliminar todo
                  </Button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}