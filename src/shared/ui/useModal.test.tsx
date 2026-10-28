import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { useModal } from './useModal'

function Modal({ open }: { open: boolean }) {
  return <dialog ref={useModal(open)}>Details</dialog>
}

it('keeps scrolling locked until the last nested modal closes and restores the previous style', () => {
  document.body.style.overflow = 'auto'
  const first = render(<Modal open />)
  const second = render(<Modal open />)
  expect(document.body.style.overflow).toBe('hidden')
  second.unmount()
  expect(document.body.style.overflow).toBe('hidden')
  first.rerender(<Modal open={false} />)
  expect(document.body.style.overflow).toBe('auto')
  document.body.style.overflow = ''
})
