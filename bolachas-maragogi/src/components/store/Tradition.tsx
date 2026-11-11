import { store } from "@/config/store"
import { Reveal } from "./Reveal"

export function Tradition() {
  const { copy, brand } = store
  return (
    <section id="tradicao" className="scroll-mt-6 bg-surface py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
        <Reveal>
          <p className="font-display text-7xl font-extralight text-primary sm:text-8xl">{brand.since}</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase">{copy.traditionTitle}</h2>
          <p className="mt-4 max-w-lg text-lg text-foreground/85">{copy.traditionText}</p>
          <p className="mt-6 border-l-4 border-orange pl-4 font-display text-2xl font-bold">{brand.slogan}</p>
          <p className="mt-3 text-sm text-muted-foreground">{brand.company} · {brand.tagline}</p>
        </Reveal>
        <Reveal delay={0.15}>
          {/* Foto real em loja (mão e corte lateral). Substituir por foto de fábrica/produção quando disponível. */}
          <img
            src="/images/banners/canela-em-loja-original.jpg"
            alt="Pacote de Bolachas Maragogi sabor canela na mão de uma pessoa, em uma prateleira de loja"
            width={1217}
            height={1600}
            loading="lazy"
            className="mx-auto max-h-[560px] w-auto rounded-3xl object-cover ring-1 ring-primary/20"
          />
        </Reveal>
      </div>
    </section>
  )
}
