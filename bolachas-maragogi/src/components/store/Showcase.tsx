import DishOrbitCarousel, { type Dish } from "@/components/ui/dish-orbit-carousel"
import { store } from "@/config/store"
import { activeProducts, formatWeight, productImage } from "@/data/products"
import { whatsappUrl } from "@/lib/whatsapp"

/** Módulo-level: o carrossel original depende da identidade estável do array `dishes`. */
const dishes: Dish[] = activeProducts.map((p) => ({
  title: "Bolacha",
  subtitle: p.flavor,
  label: [p.flavor, formatWeight(p)].filter(Boolean).join(" "),
  image: productImage(p),
  alt: p.imageAlt,
  eyebrow: `Desde ${store.brand.since}`,
  rating: store.showcase.rating,
  chef: store.brand.name,
  kitchen: [formatWeight(p) && `Pacote ${formatWeight(p)}`, store.brand.tagline.replace(/\.$/, "")].filter(Boolean).join(" · "),
  description: p.description,
  likes: store.showcase.likes,
  accent: p.accent,
}))

const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

export function Showcase() {
  return (
    <section id="destaques" aria-label="Destaques da linha">
      <DishOrbitCarousel
        dishes={dishes}
        onOrder={(dish) => {
          const url = whatsappUrl(`Olá! Quero pedir Bolachas Maragogi ${dish.subtitle}.`)
          if (url) window.open(url, "_blank", "noopener,noreferrer")
          else goTo("como-comprar")
        }}
        onPlay={() => {
          if (store.videoUrl) window.open(store.videoUrl, "_blank", "noopener,noreferrer")
          else goTo("tradicao")
        }}
      />
    </section>
  )
}
