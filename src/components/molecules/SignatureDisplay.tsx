import { useRef, useEffect } from 'react'
import SignatureCanvas from  'react-signature-canvas'

interface SignatureDisplayProps {
  signature: string
}

export const SignatureDisplay = ({ signature }: SignatureDisplayProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    if (sigCanvasRef.current && signature) {
      try {
        const data = JSON.parse(signature)
        sigCanvasRef.current.fromData(data)
      } catch {
        console.error('Invalid signature JSON')
      }
    }
  }, [signature])

  return (
    <div className="border-2 border-dashed border-[var(--border)] rounded-lg bg-white h-32 pointer-events-none">
      <SignatureCanvas
        ref={sigCanvasRef}
        penColor="black"
        canvasProps={{
          className: 'w-full h-full',
        }}
      />
    </div>
  )
}