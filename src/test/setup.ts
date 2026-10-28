import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom <dialog>ning showModal/close usullarini bilmaydi: brauzerdagidek "open" atributi bilan ishlaydigan
// soddalashtirilgan nusxa (fokus tuzog'i va ::backdrop'siz).
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  Object.defineProperty(HTMLDialogElement.prototype, 'open', {
    configurable: true,
    get(this: HTMLDialogElement) {
      return this.hasAttribute('open')
    },
    set(this: HTMLDialogElement, value: boolean) {
      this.toggleAttribute('open', value)
    },
  })
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

// Vitest globallari o'chiq — Testing Library DOM'ni o'zi tozalay olmaydi.
afterEach(() => {
  cleanup()
})
