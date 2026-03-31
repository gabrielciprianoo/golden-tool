import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders with correct size', () => {
    render(<Icon name="test" size={32} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })

  it('renders with default size', () => {
    render(<Icon name="test" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('has role presentation for accessibility', () => {
    render(<Icon name="test" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'presentation')
  })

  it('applies custom className', () => {
    render(<Icon name="test" className="custom-icon" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveClass('custom-icon')
  })

  it('uses correct href for icon', () => {
    render(<Icon name="github" />)
    const svg = document.querySelector('svg')
    const use = svg?.querySelector('use')
    expect(use?.getAttribute('href')).toBe('/icons.svg#github-icon')
  })
})
