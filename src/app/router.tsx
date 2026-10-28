import { createBrowserRouter, type RouteObject } from 'react-router'
import { GuestOnly, RequireAuth } from '@/features/auth'
import { AppLoader } from './AppLoader'
import { AuthLayout } from './layouts/AuthLayout'
import { CabinetLayout } from './layouts/CabinetLayout'

// Sahifalar alohida bo'lak (chunk) bo'lib yuklanadi: kirish sahifasi kabinet kodini kutmaydi.
export const routes: RouteObject[] = [
  {
    // birinchi ochilishda sahifa bo'lagi yuklanguncha
    HydrateFallback: AppLoader,
    children: [
      {
        // kirmaganlar uchun
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', lazy: () => import('@/pages/login/LoginPage').then((m) => ({ Component: m.LoginPage })) },
              {
                path: '/register',
                lazy: () => import('@/pages/register/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
              },
            ],
          },
        ],
      },
      {
        // faqat kirganlar uchun
        element: <RequireAuth />,
        children: [
          {
            element: <CabinetLayout />,
            children: [
              { path: '/', lazy: () => import('@/pages/home/HomePage').then((m) => ({ Component: m.HomePage })) },
              {
                path: '/invitations/new',
                lazy: () =>
                  import('@/pages/invitation-new/NewInvitationPage').then((m) => ({ Component: m.NewInvitationPage })),
              },
              {
                path: '/invitations/:id/edit',
                lazy: () =>
                  import('@/pages/invitation-edit/EditInvitationPage').then((m) => ({ Component: m.EditInvitationPage })),
              },
            ],
          },
        ],
      },
      // Mehmonlar va namuna — kirish talab qilinmaydi. /:slug eng oxirida: /login, /register va
      // /preview statik yo'llar bo'lgani uchun ulardan ustun turadi.
      {
        path: '/preview/:templateCode',
        lazy: () =>
          import('@/pages/template-preview/TemplatePreviewPage').then((m) => ({ Component: m.TemplatePreviewPage })),
      },
      {
        path: '/:slug',
        lazy: () => import('@/pages/invitation/InvitationPage').then((m) => ({ Component: m.InvitationPage })),
      },
      {
        path: '*',
        lazy: () => import('@/pages/not-found/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
