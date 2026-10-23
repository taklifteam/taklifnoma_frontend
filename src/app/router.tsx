import { createBrowserRouter } from 'react-router'
import { GuestOnly, RequireAuth } from '@/features/auth'
import { AppLoader } from './AppLoader'
import { AuthLayout } from './layouts/AuthLayout'
import { CabinetLayout } from './layouts/CabinetLayout'

// Sahifalar alohida bo'lak (chunk) bo'lib yuklanadi: kirish sahifasi kabinet kodini kutmaydi.
export const router = createBrowserRouter([
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
            children: [{ path: '/', lazy: () => import('@/pages/home/HomePage').then((m) => ({ Component: m.HomePage })) }],
          },
        ],
      },
      {
        path: '*',
        lazy: () => import('@/pages/not-found/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
])
