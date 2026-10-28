import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { fakeApi, sochqiTemplate } from '@/test/fixtures'
import { TemplatePreviewPage } from './TemplatePreviewPage'

function renderPreview() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/preview/sochqi-konvert']}>
    <Routes><Route path="/preview/:templateCode" element={<TemplatePreviewPage />} /></Routes>
  </MemoryRouter></QueryClientProvider>)
}
beforeEach(async () => { await i18n.changeLanguage('uz-Latn') })
afterEach(() => { vi.unstubAllGlobals() })

it('recovers from a catalog failure without showing a false 404', async () => {
  let failed = true
  vi.stubGlobal('fetch', fakeApi({ 'GET /api/templates': () => failed
    ? { status: 500, body: { error: { code: 'unknown' } } }
    : { status: 200, body: { items: [sochqiTemplate] } },
  }).fetch)
  const user = userEvent.setup()
  renderPreview()
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Sahifa topilmadi' })).toBeNull()
  failed = false
  await user.click(screen.getByRole('button', { name: 'Qayta urinish' }))
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Jasur')
  expect(screen.queryByRole('alert')).toBeNull()
})

it('shows 404 only after a successful catalog response without that template', async () => {
  vi.stubGlobal('fetch', fakeApi({ 'GET /api/templates': () => ({ status: 200, body: { items: [] } }) }).fetch)
  renderPreview()
  expect(await screen.findByRole('heading', { name: 'Sahifa topilmadi' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Qayta urinish' })).toBeNull()
})
