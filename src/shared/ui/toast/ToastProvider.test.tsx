import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../../i18n'
import { TOAST_DURATION, ToastProvider } from './ToastProvider'
import { useToast } from './useToast'

function Trigger() {
  const toast = useToast()
  return (
    <button type="button" onClick={() => toast.success('Foydalanuvchi bloklandi')}>
      bloklash
    </button>
  )
}

beforeEach(async () => {
  await i18n.changeLanguage('uz-Latn')
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastProvider', () => {
  it('announces the message and hides it after a while', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'bloklash' }))
    expect(screen.getByRole('status')).toHaveTextContent('Foydalanuvchi bloklandi')

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION)
    })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('closes on the close button', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'bloklash' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
