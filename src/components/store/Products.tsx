import { MessageCircle } from "lucide-react"
import { store } from "@/config/store"
import { formatPrice, formatWeight, productImage } from "@/data/products"
import { useStoreData } from "@/data/StoreData"
import { whatsappHref } from "@/lib/whatsapp"
import { Reveal } from "./Reveal"

export function Products() {
  const { products, settings } = useStoreData()
  const activeProducts = products.filter((product) => product.enabled).sort((a, b) => a.sortOrder - b.sortOrder)
  return (
    <section id="produtos" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
      <Reveal>
        <h2 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">{store.copy.productsTitle}</h2>
        <p className="mt-3 max-w-xl text-lg text-foreground/80">{store.copy.productsText}</p>
      </Reveal>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeProducts.map((p, i) => (
          <li key={p.id}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-foreground/10">
                <div className="relative grid aspect-square place-items-center p-6" style={{ background: `radial-gradient(circle at 50% 60%, ${p.accent}55, transparent 70%)` }}>
                  <img src={productImage(p)} alt={p.imageAlt} width={400} height={400} loading="lazy" className="size-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase">
                    <span className="font-extralight">Bolacha </span>{p.flavor}
                  </h3>
                  <p className="text-sm text-muted-foreground">{[formatWeight(p), "Desde 1950"].filter(Boolean).join(" · ")}</p>
                  <p className="text-sm text-foreground/85">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="font-display text-lg font-bold text-primary">{formatPrice(p)}</span>
                    <a
                      href={whatsappHref(`Olá! Quero pedir Bolachas Maragogi ${p.flavor}.`, settings.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-background transition hover:brightness-110"
                    >
                      <MessageCircle size={16} aria-hidden="true" /> Pedir
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
