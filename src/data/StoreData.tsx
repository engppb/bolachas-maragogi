import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { store } from "@/config/store"
import { activeProducts, products as initialProducts, type Product } from "@/data/products"
import { supabase } from "@/lib/supabase"

export type StoreSettings = {
  brandSlogan: string
  whatsappNumber: string
  heroImage: string
  traditionImage: string
  catalogInitialized?: boolean
}

export type StoreBanner = {
  id: string
  title: string
  image: string
  href: string
  enabled: boolean
  sortOrder: number
}

type StoreDataValue = {
  products: Product[]
  settings: StoreSettings
  banners: StoreBanner[]
}

const defaultSettings: StoreSettings = {
  brandSlogan: store.brand.slogan,
  whatsappNumber: store.whatsapp.number,
  heroImage: "/images/banners/linha-bolachas-original.jpg",
  traditionImage: "/images/banners/canela-em-loja-original.jpg",
}

const StoreDataContext = createContext<StoreDataValue>({
  products: activeProducts,
  settings: defaultSettings,
  banners: [],
})

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    flavor: String(row.flavor ?? ""),
    weightGrams: typeof row.weight_grams === "number" ? row.weight_grams : null,
    price: typeof row.price === "number" ? row.price : null,
    description: String(row.description ?? ""),
    image: typeof row.image === "string" ? row.image : null,
    imageAlt: String(row.image_alt ?? ""),
    accent: String(row.accent ?? "#b58a12"),
    enabled: Boolean(row.enabled),
    category: String(row.category ?? ""),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    gallery: Array.isArray(row.gallery) ? row.gallery.filter((image): image is string => typeof image === "string") : [],
  }
}

export function StoreDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(activeProducts)
  const [settings, setSettings] = useState(defaultSettings)
  const [banners, setBanners] = useState<StoreBanner[]>([])

  useEffect(() => {
    const client = supabase
    if (!client) return
    let active = true
    const refresh = async () => {
      const [productResult, settingsResult, bannerResult] = await Promise.all([
        client.from("products").select("*").eq("enabled", true).order("sort_order"),
        client.from("store_settings").select("*").eq("id", 1).maybeSingle(),
        client.from("banners").select("*").eq("enabled", true).order("sort_order"),
      ])
      if (!active) return
      if (productResult.error) {
        console.error("Não foi possível carregar o catálogo remoto:", productResult.error.message)
      } else if (productResult.data?.length) {
        setProducts(productResult.data.map((row) => mapProduct(row as Record<string, unknown>)))
      } else if (productResult.data?.length === 0) {
        const catalogInitialized = Boolean(
          settingsResult.data?.settings &&
          typeof settingsResult.data.settings === "object" &&
          "catalogInitialized" in settingsResult.data.settings &&
          settingsResult.data.settings.catalogInitialized,
        )
        setProducts(catalogInitialized ? [] : initialProducts.filter((product) => product.enabled))
      }
      if (settingsResult.error) {
        console.error("Não foi possível carregar as configurações da loja:", settingsResult.error.message)
      } else if (settingsResult.data?.settings && typeof settingsResult.data.settings === "object") {
        setSettings({ ...defaultSettings, ...settingsResult.data.settings })
      }
      if (bannerResult.error) {
        console.error("Não foi possível carregar os banners:", bannerResult.error.message)
      } else if (bannerResult.data) {
        setBanners(bannerResult.data as StoreBanner[])
      }
    }

    void refresh()
    const channel = client
      .channel("public-store-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => void refresh())
      .subscribe()
    const interval = window.setInterval(() => void refresh(), 30000)

    return () => {
      active = false
      window.clearInterval(interval)
      void client.removeChannel(channel)
    }
  }, [])

  const value = useMemo(() => ({ products, settings, banners }), [products, settings, banners])
  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>
}

export const useStoreData = () => useContext(StoreDataContext)
