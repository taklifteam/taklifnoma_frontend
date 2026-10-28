/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ModelsAdminUserDetailResponse {
  created_at: string;
  email?: string | null;
  full_name: string;
  /**
   * @format uuid
   * @example "0199a3c4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
   */
  id: string;
  invitations_count: number;
  last_login_at?: string | null;
  locale: string;
  phone?: string | null;
  profile?: ModelsClientProfileResponse | null;
  published_count: number;
  role: ModelsRoleBriefResponse;
  status: string;
}

export interface ModelsAdminUserResponse {
  created_at: string;
  email?: string | null;
  full_name: string;
  /**
   * @format uuid
   * @example "0199a3c4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
   */
  id: string;
  invitations_count: number;
  is_staff: boolean;
  last_login_at?: string | null;
  phone?: string | null;
  published_count: number;
  role: string;
  status: string;
}

export interface ModelsCategoryResponse {
  code: string;
  id: number;
  /** @example {"ru":"Свадьба","uz-Cyrl":"Никоҳ тўйи","uz-Latn":"Nikoh to'yi"} */
  name: Record<string, string>;
}

export interface ModelsChangeUserRoleRequest {
  role_code: string;
}

export interface ModelsClientProfileResponse {
  admin_note: string;
  last_paid_at?: string | null;
  source: string;
  total_paid_tiyin: number;
}

export interface ModelsCreateInvitationRequest {
  /**
   * CategoryCode — tadbir turi, andozaning categories ro'yxatidan; bo'sh bo'lsa — asosiysi.
   * @example "wedding"
   */
  category_code?: string;
  content: Record<string, string>;
  /** @example "2026-11-14T18:00:00+05:00" */
  event_at: string;
  /** https:// bilan; bo'sh bo'lsa manzil bo'yicha qidiriladi */
  map_url?: string | null;
  /** @example "sochqi-konvert" */
  template_code: string;
  /** @example "Jasur & Madina" */
  title: string;
  venue_address: string;
  venue_name: string;
}

export interface ModelsCreateStaffRequest {
  email?: string;
  full_name: string;
  password: string;
  phone: string;
  role_code: string;
}

export interface ModelsErrorBody {
  /** frontend shu kod bo'yicha ishlaydi */
  code: string;
  /** maydon → sabab (faqat validation) */
  fields?: Record<string, string>;
  message: string;
}

export interface ModelsErrorResponse {
  error: ModelsErrorBody;
}

export interface ModelsInvitationResponse {
  /** @example "wedding" */
  category_code: string;
  content: Record<string, string>;
  created_at: string;
  default_locale: string;
  event_at: string;
  /** havola shu vaqtgacha ochiladi */
  expires_at?: string | null;
  /**
   * Fields — shu taklifnoma andoza versiyasining matn maydonlari (tahrirlash formasi uchun):
   * andozaning yangi versiyasi chiqsa ham, taklifnoma o'z versiyasida qoladi.
   */
  fields: ModelsTemplateField[];
  /** @format uuid */
  id: string;
  map_url?: string | null;
  published_at?: string | null;
  renderer_key: string;
  /**
   * tizim yaratadi, o'zgarmaydi
   * @example "k7mx2qvd"
   */
  slug: string;
  status: "draft" | "published" | "expired" | "blocked";
  template_code: string;
  template_version: number;
  /** @example "Asia/Tashkent" */
  timezone: string;
  title: string;
  updated_at: string;
  /**
   * mehmonlarga yuboriladigan havola
   * @example "https://taklifnoma.uz/k7mx2qvd"
   */
  url: string;
  venue_address: string;
  venue_name: string;
}

export interface ModelsListResponseModelsCategoryResponse {
  items: ModelsCategoryResponse[];
}

export interface ModelsListResponseModelsInvitationResponse {
  items: ModelsInvitationResponse[];
}

export interface ModelsListResponseModelsRoleBriefResponse {
  items: ModelsRoleBriefResponse[];
}

export interface ModelsListResponseModelsRoleResponse {
  items: ModelsRoleResponse[];
}

export interface ModelsListResponseModelsTemplateResponse {
  items: ModelsTemplateResponse[];
}

export interface ModelsListResponseModelsUserInvitationItemResponse {
  items: ModelsUserInvitationItemResponse[];
}

export interface ModelsLoginRequest {
  /** telefon yoki email */
  login: string;
  password: string;
}

export interface ModelsMeResponse {
  email?: string | null;
  full_name: string;
  /**
   * @format uuid
   * @example "0199a3c4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
   */
  id: string;
  is_staff: boolean;
  locale: string;
  permissions: string[];
  phone?: string | null;
  role: string;
}

export interface ModelsPageResponseModelsAdminUserResponse {
  items: ModelsAdminUserResponse[];
  next_cursor?: string | null;
}

export interface ModelsPublicInvitationResponse {
  category_code: string;
  content: Record<string, string>;
  event_at: string;
  locale: string;
  map_url?: string | null;
  renderer_key: string;
  slug: string;
  timezone: string;
  title: string;
  venue_address: string;
  venue_name: string;
}

export interface ModelsRefreshRequest {
  refresh_token: string;
}

export interface ModelsRegisterRequest {
  full_name: string;
  password: string;
  phone: string;
}

export interface ModelsRoleBriefResponse {
  code: string;
  id: number;
  is_staff: boolean;
  name: string;
}

export interface ModelsRoleResponse {
  code: string;
  description: string;
  id: number;
  is_staff: boolean;
  is_system: boolean;
  name: string;
  permissions: string[];
}

export interface ModelsTemplateField {
  /** @example "groom" */
  key: string;
  /**
   * 0 — chegara yo'q
   * @example 40
   */
  max_length: number;
  required: boolean;
}

export interface ModelsTemplateResponse {
  /** @example ["wedding","engagement"] */
  categories: string[];
  /** @example "sochqi-konvert" */
  code: string;
  default_content: Record<string, string>;
  fields: ModelsTemplateField[];
  /** @format uuid */
  id: string;
  /** {"uz-Latn": "...", "uz-Cyrl": "...", "ru": "..."} */
  name: Record<string, string>;
  price_tiyin: number;
  /** @example "sochqi-konvert@1" */
  renderer_key: string;
  tags: string[];
}

export interface ModelsTokenResponse {
  /** "Authorization: Bearer <access_token>" */
  access_token: string;
  /**
   * access token necha soniyadan keyin eskiradi
   * @example 900
   */
  expires_in: number;
  /** bir martalik: /api/auth/refresh har safar yangisini beradi */
  refresh_token: string;
  /** @example "Bearer" */
  token_type: string;
  user: ModelsMeResponse;
}

export interface ModelsUpdateAdminNoteRequest {
  admin_note: string;
}

export interface ModelsUpdateInvitationRequest {
  content: Record<string, string>;
  /** @example "2026-11-14T18:00:00+05:00" */
  event_at: string;
  /** https:// bilan; bo'sh bo'lsa manzil bo'yicha qidiriladi */
  map_url?: string | null;
  /** @example "Jasur & Madina" */
  title: string;
  venue_address: string;
  venue_name: string;
}

export interface ModelsUserInvitationItemResponse {
  created_at: string;
  event_at: string;
  /** @format uuid */
  id: string;
  published_at?: string | null;
  slug: string;
  status: string;
  title: string;
}
