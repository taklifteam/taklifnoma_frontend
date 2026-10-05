import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest globallari o'chiq — Testing Library DOM'ni o'zi tozalay olmaydi.
afterEach(() => {
  cleanup()
})
