import { useStoreData } from "@/data/StoreData"

export function StoreBanners() {
  const { banners } = useStoreData()
  if (!banners.length) return null
  return (
    <section aria-label="Novidades da loja" className="mx-auto grid max-w-6xl gap-5 px-5 pb-12 sm:grid-cols-2">
      {banners.map((banner) => {
        const image = <img src={banner.image} alt={banner.title} loading="lazy" className="aspect-[16/7] w-full rounded-2xl object-cover ring-1 ring-foreground/10" />
        const safeHref = /^https?:\/\//i.test(banner.href) ? banner.href : ""
        return (
          <article key={banner.id}>
            {safeHref ? <a href={safeHref} target="_blank" rel="noopener noreferrer" aria-label={banner.title || "Abrir banner"}>{image}</a> : image}
            {banner.title && <h2 className="mt-2 font-display text-lg font-bold">{banner.title}</h2>}
          </article>
        )
      })}
    </section>
  )
}
