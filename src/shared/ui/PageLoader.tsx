import s from './PageLoader.module.css'
import { Spinner } from './Spinner'

/** Butun sahifa yuklanayotganda (masalan, sessiya tiklanayotganda). */
export function PageLoader({ label }: { label: string }) {
  return (
    <div className={s.loader}>
      <Spinner label={label} />
    </div>
  )
}
