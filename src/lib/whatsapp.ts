import { store } from "@/config/store"

/** Retorna o link do WhatsApp, ou null se o número ainda não foi configurado. */
export function whatsappUrl(message?: string, number = store.whatsapp.number): string | null {
  const digits = number.replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message ?? store.whatsapp.defaultMessage)}`
}

/** Link seguro para href: sem número, leva à seção "Como comprar". */
export const whatsappHref = (message?: string, number?: string) => whatsappUrl(message, number) ?? "#como-comprar"
