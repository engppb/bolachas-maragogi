import { MessageCircle } from "lucide-react"
import { whatsappHref } from "@/lib/whatsapp"
import { useStoreData } from "@/data/StoreData"

export function WhatsAppFab() {
  const { settings } = useStoreData()
  return (
    <a
      href={whatsappHref(undefined, settings.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  )
}
