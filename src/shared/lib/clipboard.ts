/** Matnni nusxalaydi. Clipboard API yo'q yoki ruxsat berilmagan bo'lsa (eski brauzer, http) — false. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
