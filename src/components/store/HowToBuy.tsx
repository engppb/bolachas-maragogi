import { MessageCircle, ShoppingBasket, Truck } from "lucide-react"
import { store } from "@/config/store"
import { whatsappHref } from "@/lib/whatsapp"
import { Reveal } from "./Reveal"
import { useStoreData } from "@/data/StoreData"

const icons = [ShoppingBasket, MessageCircle, Truck]

export function HowToBuy() {
  const { copy } = store
  const { settings } = useStoreData()
  return (
    <section id="como-comprar" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
      <Reveal>
        <h2 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">{copy.howToBuyTitle}</h2>
        <p className="mt-3 text-lg text-foreground/80">{copy.howToBuyText}</p>
      </Reveal>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {copy.steps.map((s, i) => {
          const Icon = icons[i] ?? ShoppingBasket
          return (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="h-full rounded-3xl bg-surface p-6 ring-1 ring-foreground/10">
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-background"><Icon size={22} aria-hidden="true" /></span>
                  <p className="mt-4 font-display text-sm font-bold text-orange">Passo {i + 1}</p>
                  <h3 className="font-display text-xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 text-foreground/80">{s.text}</p>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ol>
      <div className="mt-10 text-center">
        <a
          href={whatsappHref(undefined, settings.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-background transition hover:brightness-110"
        >
          <MessageCircle size={20} aria-hidden="true" /> Falar no WhatsApp
        </a>
        {!settings.whatsappNumber && <p className="mt-3 text-sm text-muted-foreground">Número de WhatsApp ainda não configurado (src/config/store.ts).</p>}
      </div>
    </section>
  )
}
