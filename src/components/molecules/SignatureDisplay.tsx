import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignatureDisplayProps {
  signature: string
}

export const SignatureDisplay = ({
  signature,
}: SignatureDisplayProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    if (!sigCanvasRef.current || !signature) return

    try {
      const data = JSON.parse(signature)

      const canvas = sigCanvasRef.current.getCanvas()

      // Tamaño REAL del canvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      sigCanvasRef.current.clear()

      // Dibujar firma
      sigCanvasRef.current.fromData(data)

      // Desactivar interacción
      sigCanvasRef.current.off()
    } catch (error) {
      console.error('Invalid signature JSON', error)
    }
  }, [signature])

  return (
    <div className="border-2 border-dashed border-[var(--border)] rounded-lg bg-white h-full w-full overflow-hidden">
      <SignatureCanvas
        ref={sigCanvasRef}
        penColor="black"
        canvasProps={{
          width: 600,
          height: 220,
          className: 'w-full h-full',
        }}
      />
    </div>
  )
}