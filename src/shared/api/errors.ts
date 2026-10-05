import type { ModelsErrorBody } from './types'

/**
 * Backend xatosi: {"error": {"code", "message", "fields"}}.
 * Frontend `code` bo'yicha ishlaydi (tarjima kaliti ham shu): invalid_credentials, phone_taken ...
 * Tarmoq xatosi — status 0, code "network".
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** maydon → sabab kodi (faqat code === "validation" bo'lganda) */
  readonly fields: Record<string, string>

  constructor(status: number, body: ModelsErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fields = body.fields ?? {}
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
