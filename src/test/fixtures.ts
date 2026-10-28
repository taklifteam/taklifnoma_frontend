import type { ModelsInvitationResponse, ModelsTemplateResponse } from '@/shared/api'
import { sampleEventAt } from '@/templates/lib/eventDate'

export const sochqiTemplate: ModelsTemplateResponse = {
  id: '00000000-0000-0000-0000-000000000001',
  code: 'sochqi-konvert',
  name: { 'uz-Latn': 'Sochqi · Konvert' },
  renderer_key: 'sochqi-konvert@1',
  price_tiyin: 0,
  tags: [],
  categories: ['wedding', 'engagement'],
  default_content: { groom: 'Jasur', bride: 'Madina', greeting_text: '{groom} va {bride}ning to‘yi' },
  fields: [
    { key: 'bride', max_length: 40, required: true },
    { key: 'groom', max_length: 40, required: true },
    { key: 'greeting_text', max_length: 600, required: false },
    { key: 'hosts', max_length: 80, required: false },
  ],
}

export const categories = [
  { id: 1, code: 'wedding', name: { 'uz-Latn': 'Nikoh to‘yi' } },
  { id: 2, code: 'engagement', name: { 'uz-Latn': 'Fotiha to‘yi' } },
]

export function invitation(overrides: Partial<ModelsInvitationResponse> = {}): ModelsInvitationResponse {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'k7mx2qvd',
    url: 'https://taklifnoma.uz/k7mx2qvd',
    title: 'Jasur & Madina',
    status: 'draft',
    template_code: 'sochqi-konvert',
    template_version: 1,
    renderer_key: 'sochqi-konvert@1',
    category_code: 'wedding',
    fields: sochqiTemplate.fields,
    event_at: sampleEventAt(), // 30 kundan keyin, 18:00 Toshkent
    timezone: 'Asia/Tashkent',
    default_locale: 'uz-Latn',
    venue_name: 'Navro‘z',
    venue_address: 'Toshkent',
    map_url: null,
    content: { groom: 'Jasur', bride: 'Madina' },
    published_at: null,
    expires_at: null,
    created_at: '2026-10-27T10:00:00Z',
    updated_at: '2026-10-27T10:00:00Z',
    ...overrides,
  }
}

type Handler = (init: RequestInit) => { status: number; body?: unknown }

/** fetch soxtasi: "METHOD /yo'l" → javob. Kutilmagan so'rov — test xatosi. */
export function fakeApi(routes: Record<string, Handler>) {
  const calls: { key: string; body: unknown }[] = []
  const fetch = async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? 'GET'} ${url}`
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ key, body })
    const handler = routes[key]
    if (!handler) throw new Error(`kutilmagan so'rov: ${key}`)
    const res = handler(init)
    return new Response(res.body === undefined ? null : JSON.stringify(res.body), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return { fetch, calls }
}
