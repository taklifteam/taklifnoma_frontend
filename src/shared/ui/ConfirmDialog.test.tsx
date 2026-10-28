import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '../i18n'
import { ConfirmDialog } from './ConfirmDialog'

function Harness({ onConfirm, loading = false }: { onConfirm: () => void; loading?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        ochish
      </button>
      <ConfirmDialog
        open={open}
        title="Foydalanuvchini bloklaysizmi?"
        description="U tizimdan chiqariladi."
        confirmLabel="Bloklash"
        tone="danger"
        loading={loading}
        onConfirm={onConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

const dialog = () => screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement

beforeEach(async () => {
  await i18n.changeLanguage('uz-Latn')
})

describe('ConfirmDialog', () => {
  it('opens on demand and calls onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} />)
    expect(dialog().open).toBe(false)

    await user.click(screen.getByRole('button', { name: 'ochish' }))
    expect(dialog().open).toBe(true)
    expect(dialog()).toHaveAccessibleName('Foydalanuvchini bloklaysizmi?')
    expect(dialog()).toHaveAccessibleDescription('U tizimdan chiqariladi.')

    await user.click(screen.getByRole('button', { name: 'Bloklash' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('closes on "Bekor qilish" and on Escape', async () => {
    const user = userEvent.setup()
    render(<Harness onConfirm={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'ochish' }))
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }))
    expect(dialog().open).toBe(false)

    await user.click(screen.getByRole('button', { name: 'ochish' }))
    fireEvent(dialog(), new Event('cancel', { cancelable: true }))
    expect(dialog().open).toBe(false)
  })

  it('stays open while the action is running', async () => {
    const user = userEvent.setup()
    render(<Harness onConfirm={vi.fn()} loading />)

    await user.click(screen.getByRole('button', { name: 'ochish' }))
    fireEvent(dialog(), new Event('cancel', { cancelable: true }))

    expect(dialog().open).toBe(true)
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled()
  })
})
