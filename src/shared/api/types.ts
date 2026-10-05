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

export interface ModelsListResponseModelsRoleResponse {
  items: ModelsRoleResponse[];
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

export interface ModelsRefreshRequest {
  refresh_token: string;
}

export interface ModelsRegisterRequest {
  full_name: string;
  password: string;
  phone: string;
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
