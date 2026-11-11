import { store } from "@/config/store"
import { useStoreData } from "@/data/StoreData"

export function Footer() {
  const { brand, contact } = store
  const { settings } = useStoreData()
  const rows = [contact.address, contact.city, contact.hours, contact.email].filter(Boolean)
  return (
    <footer className="border-t border-foreground/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold uppercase">Bolachas <span className="text-primary">Maragogi</span></p>
          <p className="mt-2 text-sm text-foreground/80">{settings.brandSlogan}</p>
          <p className="text-sm text-muted-foreground">Desde {brand.since}</p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-col text-sm">
          {[["#produtos", "Produtos"], ["#tradicao", "Tradição"], ["#como-comprar", "Como comprar"]].map(([h, l]) => (
            <a key={h} href={h} className="flex min-h-11 items-center text-foreground/85 hover:text-primary">{l}</a>
          ))}
        </nav>
        <div className="space-y-1 text-sm text-foreground/85">
          {rows.map((r) => <p key={r}>{r}</p>)}
          {contact.instagram && <a className="text-primary underline" href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {!rows.length && !contact.instagram && <p className="text-muted-foreground">Dados de contato pendentes (src/config/store.ts).</p>}
        </div>
      </div>
      <p className="border-t border-foreground/10 px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand.company}{contact.cnpj ? ` · CNPJ ${contact.cnpj}` : ""}. Todos os direitos reservados.
      </p>
    </footer>
  )
}
