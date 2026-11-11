import { MotionConfig } from "motion/react"
import { Header } from "@/components/store/Header"
import { Hero } from "@/components/store/Hero"
import { Showcase } from "@/components/store/Showcase"
import { Products } from "@/components/store/Products"
import { Tradition } from "@/components/store/Tradition"
import { HowToBuy } from "@/components/store/HowToBuy"
import { Footer } from "@/components/store/Footer"
import { WhatsAppFab } from "@/components/store/WhatsAppFab"
import { StoreDataProvider } from "@/data/StoreData"
import { AdminApp } from "@/components/admin/AdminApp"
import { StoreBanners } from "@/components/store/StoreBanners"

function PublicStore() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Sem overflow em ancestrais: o carrossel original usa position: sticky. */}
      <Header />
      <main>
        <Hero />
        <StoreBanners />
        <Showcase />
        <Products />
        <Tradition />
        <HowToBuy />
      </main>
      <Footer />
      <WhatsAppFab />
    </MotionConfig>
  )
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, "") === "/admin") return <AdminApp />
  return <StoreDataProvider><PublicStore /></StoreDataProvider>
}
