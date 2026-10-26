import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button loading state', () => {
  it('keeps its accessible name and icon space while preventing another submit', () => {
    const { rerender } = render(<Button trailingIcon={<svg data-testid="arrow" />}>Saqlash</Button>)
    rerender(<Button loading trailingIcon={<svg data-testid="arrow" />}>Saqlash</Button>)

    const button = screen.getByRole('button', { name: 'Saqlash' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('arrow')).toBeInTheDocument()
  })
})
