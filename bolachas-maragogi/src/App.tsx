import { MotionConfig } from "motion/react"
import { Header } from "@/components/store/Header"
import { Hero } from "@/components/store/Hero"
import { Showcase } from "@/components/store/Showcase"
import { Products } from "@/components/store/Products"
import { Tradition } from "@/components/store/Tradition"
import { HowToBuy } from "@/components/store/HowToBuy"
import { Footer } from "@/components/store/Footer"
import { WhatsAppFab } from "@/components/store/WhatsAppFab"

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Sem overflow em ancestrais: o carrossel original usa position: sticky. */}
      <Header />
      <main>
        <Hero />
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
