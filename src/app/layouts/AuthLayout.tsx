import { Outlet } from 'react-router'
import { LanguageSwitcher, Logo, Rings, SochqiScene } from '@/shared/ui'
import s from './AuthLayout.module.css'

/** Kirish va ro'yxatdan o'tish: orqada sochqi sahnasi, markazda uzukli karta ichida forma. */
export function AuthLayout() {
  return (
    <div className={s.page}>
      <SochqiScene className={s.scene} />
      <header className={s.header}>
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className={s.main}>
        <div className={s.card}>
          <Rings className={s.rings} />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
