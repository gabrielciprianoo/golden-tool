import { useState } from 'react'
import { ToolTable } from '../components/inventory/ToolTable'
import { ToolForm } from '../components/inventory/ToolForm'
import { DeleteConfirmModal } from '../components/inventory/DeleteConfirmModal'
import { Modal } from '../components/molecules/Modal'
import { useInventory } from '../hooks/useInventory'
import type { Tool, ToolInput } from '../types/inventory'

export const InventoryPage = () => {
  const {
    tools,
    isLoading,
    isSubmitting,
    filters,
    filteredTools,
    setFilters,
    createTool,
    updateTool,
    deleteTool,
  } = useInventory()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null)

  const handleSubmit = async (data: ToolInput) => {
    if (editingTool) {
      await updateTool(editingTool.id, data)
    } else {
      await createTool(data)
    }
    setIsModalOpen(false)
    setEditingTool(null)
  }

  const handleDelete = async () => {
    if (deletingTool) {
      await deleteTool(deletingTool.id)
    }
    setIsDeleteModalOpen(false)
    setDeletingTool(null)
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setEditingTool(null)
    setIsModalOpen(true)
  }

  const openDeleteModal = (tool: Tool) => {
    setDeletingTool(tool)
    setIsDeleteModalOpen(true)
  }

  return (
    <>
      <ToolTable
        tools={filteredTools}
        isLoading={isLoading}
        search={filters.search}
        supplier={filters.supplier}
        category={filters.category}
        status={filters.status}
        totalCount={tools.length}
        onSearchChange={(value) => setFilters({ search: value })}
        onSupplierChange={(value) => setFilters({ supplier: value })}
        onCategoryChange={(value) => setFilters({ category: value })}
        onStatusChange={(value) => setFilters({ status: value })}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
        onCreateNew={handleCreateNew}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTool ? 'Editar herramienta' : 'Nueva herramienta'}
        size="lg"
      >
        <ToolForm
          tool={editingTool}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        toolName={deletingTool?.name || ''}
        isLoading={isSubmitting}
      />
    </>
  )
}
