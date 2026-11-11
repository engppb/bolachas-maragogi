import { Sailboat, MessageCircle } from "lucide-react"
import { store } from "@/config/store"
import { whatsappHref } from "@/lib/whatsapp"
import { useStoreData } from "@/data/StoreData"

const nav = [
  { href: "#produtos", label: "Produtos" },
  { href: "#tradicao", label: "Tradição" },
  { href: "#como-comprar", label: "Como comprar" },
]

/** Cabeçalho no fluxo normal (não fixo) para não cobrir o palco fixado do carrossel. */
export function Header() {
  const { settings } = useStoreData()
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
      <a href="#" className="flex min-h-11 items-center gap-2.5" aria-label={store.brand.name}>
        <span className="grid size-10 place-items-center rounded-full bg-orange text-foreground">
          <Sailboat size={22} aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight">
          Bolachas <span className="text-primary">Maragogi</span>
        </span>
      </a>
      <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
        {nav.map((n) => (
          <a key={n.href} href={n.href} className="flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-foreground/85 hover:text-primary">
            {n.label}
          </a>
        ))}
      </nav>
      <a
        href={whatsappHref(undefined, settings.whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-background transition hover:brightness-110"
      >
        <MessageCircle size={18} aria-hidden="true" /> Pedir
      </a>
    </header>
  )
}
