import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type ModelsCreateInvitationRequest,
  type ModelsInvitationResponse,
  type ModelsListResponseModelsCategoryResponse,
  type ModelsListResponseModelsInvitationResponse,
  type ModelsListResponseModelsTemplateResponse,
  type ModelsPublicInvitationResponse,
  type ModelsUpdateInvitationRequest,
} from '@/shared/api'

export const invitationKeys = {
  all: ['invitations'] as const,
  mine: ['invitations', 'mine'] as const,
  detail: (id: string) => ['invitations', 'detail', id] as const,
  public: (slug: string) => ['public-invitation', slug] as const,
  templates: ['templates'] as const,
  categories: ['categories'] as const,
}

/** Mehmon ochadigan taklifnoma (token kerak emas). E'lon qilinmagan yoki muddati o'tgan — 404. */
export function usePublicInvitation(slug: string) {
  return useQuery({
    queryKey: invitationKeys.public(slug),
    queryFn: ({ signal }) =>
      api.get<ModelsPublicInvitationResponse>(`/api/public/invitations/${encodeURIComponent(slug)}`, { auth: false, signal }),
  })
}

/** Katalogdagi faol andozalar (ochiq). */
export function useTemplates() {
  return useQuery({
    queryKey: invitationKeys.templates,
    queryFn: ({ signal }) => api.get<ModelsListResponseModelsTemplateResponse>('/api/templates', { auth: false, signal }),
    select: (data) => data.items,
    staleTime: 5 * 60_000,
  })
}

/** Tadbir turlari (nomlari bilan). */
export function useCategories() {
  return useQuery({
    queryKey: invitationKeys.categories,
    queryFn: ({ signal }) => api.get<ModelsListResponseModelsCategoryResponse>('/api/categories', { signal }),
    select: (data) => data.items,
    staleTime: 5 * 60_000,
  })
}

/** Joriy mijozning taklifnomalari, yangilari birinchi. */
export function useMyInvitations() {
  return useQuery({
    queryKey: invitationKeys.mine,
    queryFn: ({ signal }) => api.get<ModelsListResponseModelsInvitationResponse>('/api/invitations', { signal }),
    select: (data) => data.items,
  })
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: invitationKeys.detail(id),
    queryFn: ({ signal }) => api.get<ModelsInvitationResponse>(`/api/invitations/${encodeURIComponent(id)}`, { signal }),
  })
}

// O'zgartiruvchi so'rovlardan keyin ro'yxat va kartochka qayta o'qiladi.
function useInvalidate() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: invitationKeys.all })
}

export function useCreateInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: ModelsCreateInvitationRequest) => api.post<ModelsInvitationResponse>('/api/invitations', body),
    onSuccess: invalidate,
  })
}

export function useUpdateInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ModelsUpdateInvitationRequest }) =>
      api.put<ModelsInvitationResponse>(`/api/invitations/${encodeURIComponent(id)}`, body),
    onSuccess: invalidate,
  })
}

export function usePublishInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.post<ModelsInvitationResponse>(`/api/invitations/${encodeURIComponent(id)}/publish`),
    onSuccess: invalidate,
  })
}

export function useDeleteInvitation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/invitations/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}
