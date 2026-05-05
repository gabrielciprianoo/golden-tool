import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Modal } from './Modal'
import { Button } from '../atoms/Button'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signature: string) => void
  title: string
}

export const SignatureModal = ({ isOpen, onClose, onSave, title }: SignatureModalProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleSave = () => {
    if (sigCanvasRef.current && !isEmpty) {
      const signature = JSON.stringify(sigCanvasRef.current.toData())
      onSave(signature)
      handleClose()
    }
  }

  const handleClear = () => {
    sigCanvasRef.current?.clear()
    setIsEmpty(true)
  }

  const handleClose = () => {
    sigCanvasRef.current?.clear()
    setIsEmpty(true)
    onClose()
  }

  const handleEnd = () => {
    setIsEmpty(sigCanvasRef.current?.isEmpty() ?? true)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-[var(--border)] rounded-lg bg-white">
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="black"
            canvasProps={{
              className: 'w-full h-64',
            }}
            onEnd={handleEnd}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Limpiar
          </Button>
          <Button onClick={handleSave} disabled={isEmpty}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}