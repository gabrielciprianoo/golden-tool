import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>)
    expect(container.firstChild).toHaveClass('shadow-lg')
  })

  it('applies padding classes', () => {
    const { container } = render(<Card padding="lg">Padded</Card>)
    expect(container.firstChild).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has rounded-xl class', () => {
    const { container } = render(<Card>Test</Card>)
    expect(container.firstChild).toHaveClass('rounded-xl')
  })
})
