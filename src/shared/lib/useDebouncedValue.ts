import { useEffect, useState } from 'react'

/** Qiymat o'zgarishi to'xtagach, delay ms o'tib yangilanadi (masalan, yozish paytida preview). */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
