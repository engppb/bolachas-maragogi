import { store } from "@/config/store"

/** Retorna o link do WhatsApp, ou null se o número ainda não foi configurado. */
export function whatsappUrl(message?: string): string | null {
  const digits = store.whatsapp.number.replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message ?? store.whatsapp.defaultMessage)}`
}

/** Link seguro para href: sem número, leva à seção "Como comprar". */
export const whatsappHref = (message?: string) => whatsappUrl(message) ?? "#como-comprar"
