import { ArrowDown, MessageCircle } from "lucide-react"
import { store } from "@/config/store"
import { whatsappHref } from "@/lib/whatsapp"
import { Reveal } from "./Reveal"
import { useStoreData } from "@/data/StoreData"

export function Hero() {
  const { copy, brand } = store
  const { settings } = useStoreData()
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-2 md:pb-24 md:pt-14">
      <Reveal>
        <p className="mb-4 inline-flex rounded-full border border-primary/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          Desde {brand.since}
        </p>
        <h1 className="font-display uppercase leading-[0.95]">
          <span className="block text-5xl font-extralight sm:text-6xl lg:text-7xl">{copy.heroTitleThin}</span>
          <span className="block text-5xl font-extrabold text-primary sm:text-6xl lg:text-7xl">{copy.heroTitleHeavy}</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-foreground/85">{copy.heroText}</p>
        <p className="mt-2 font-display text-xl font-bold text-orange">{settings.brandSlogan}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#destaques" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-background transition hover:brightness-110">
            Ver as bolachas <ArrowDown size={18} aria-hidden="true" />
          </a>
          <a
            href={whatsappHref(undefined, settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-foreground/30 px-6 font-bold transition hover:border-primary hover:text-primary"
          >
            <MessageCircle size={18} aria-hidden="true" /> Pedir pelo WhatsApp
          </a>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        {/* Foto real enviada pela marca. Proporção recorta a base da imagem (ícone de captura de tela). Trocar por foto original em /public/images/banners. */}
        <div className="relative overflow-hidden rounded-3xl bg-black shadow-[0_30px_80px_-30px_rgba(255,200,30,.35)] ring-1 ring-primary/20">
          <img
            src={settings.heroImage}
            alt="Pacotes de Bolachas Maragogi: salgada, doce e outro sabor, sobre fundo escuro"
            width={1320}
            height={1100}
            className="aspect-[1320/1100] w-full object-cover object-top"
            fetchPriority="high"
          />
        </div>
      </Reveal>
    </section>
  )
}
