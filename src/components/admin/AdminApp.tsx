import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  Archive, ArrowDownToLine, BarChart3, Check, ChevronDown, ImagePlus, LogOut,
  Package, Plus, Save, Settings, ShieldCheck, Trash2, Upload, X,
} from "lucide-react"
import { products as initialProducts, type Product } from "@/data/products"
import { type StoreBanner, type StoreSettings } from "@/data/StoreData"
import { supabase, supabaseConfigured } from "@/lib/supabase"
import { store } from "@/config/store"
import type { Session } from "@supabase/supabase-js"

type View = "overview" | "products" | "images" | "banners" | "settings" | "backup"

const defaultSettings: StoreSettings = {
  brandSlogan: store.brand.slogan,
  whatsappNumber: store.whatsapp.number,
  heroImage: "/images/banners/linha-bolachas-original.jpg",
  traditionImage: "/images/banners/canela-em-loja-original.jpg",
}

const emptyProduct = (sortOrder: number): Product => ({
  id: crypto.randomUUID(),
  flavor: "",
  weightGrams: null,
  price: null,
  description: "",
  image: null,
  imageAlt: "",
  accent: "#b58a12",
  enabled: true,
  category: "",
  sortOrder,
  gallery: [],
})

const toRow = (product: Product) => ({
  id: product.id,
  flavor: product.flavor.trim(),
  weight_grams: product.weightGrams,
  price: product.price,
  description: product.description.trim(),
  image: product.image,
  image_alt: product.imageAlt.trim(),
  accent: product.accent,
  enabled: product.enabled,
  category: product.category.trim(),
  sort_order: product.sortOrder,
  gallery: product.gallery,
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

function fieldClass() {
  return "mt-1 w-full rounded-xl border border-white/15 bg-[#0b1030] px-3 py-2.5 text-sm text-[#fff4d6] outline-none focus:border-[#ffc81e]"
}

function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{children}</button>
}

function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b1030] px-5 py-10 text-[#fff4d6]">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141b4a] p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#ffc81e]">Desde 1950</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Acesso administrativo</h1>
        <p className="mt-2 text-sm text-[#c9c3a8]">Entre com uma conta criada previamente pelo administrador no Supabase.</p>
        <label className="mt-6 block text-sm font-semibold">E-mail<input className={fieldClass()} type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="mt-4 block text-sm font-semibold">Senha<input className={fieldClass()} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-950/70 px-3 py-2 text-sm text-red-200">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-6 w-full bg-[#ffc81e] text-[#0b1030]">{loading ? "Entrando..." : "Entrar"}</Button>
      </form>
    </main>
  )
}

function ProductEditor({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (product: Product) => void }) {
  const [draft, setDraft] = useState(product)
  const [error, setError] = useState("")
  const patch = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.flavor.trim()) {
      setError("Informe o nome do produto.")
      return
    }
    if (draft.weightGrams !== null && (!Number.isFinite(draft.weightGrams) || draft.weightGrams <= 0)) {
      setError("O peso deve ser maior que zero ou ficar em branco.")
      return
    }
    if (draft.price !== null && (!Number.isFinite(draft.price) || draft.price < 0)) {
      setError("O preço deve ser zero ou maior, ou ficar em branco.")
      return
    }
    onSave(draft)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <form onSubmit={submit} className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#141b4a] p-6 text-[#fff4d6]">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold">{product.flavor ? "Editar produto" : "Novo produto"}</h2><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Nome / sabor<input className={fieldClass()} value={draft.flavor} onChange={(e) => patch("flavor", e.target.value)} required /></label>
          <label className="text-sm">Categoria<input className={fieldClass()} value={draft.category} onChange={(e) => patch("category", e.target.value)} /></label>
          <label className="text-sm">Peso em gramas<input className={fieldClass()} type="number" min="1" value={draft.weightGrams ?? ""} onChange={(e) => patch("weightGrams", e.target.value ? Number(e.target.value) : null)} /></label>
          <label className="text-sm">Preço em R$<input className={fieldClass()} type="number" min="0" step="0.01" value={draft.price ?? ""} onChange={(e) => patch("price", e.target.value ? Number(e.target.value) : null)} /></label>
          <label className="text-sm sm:col-span-2">Descrição<textarea className={fieldClass()} rows={3} value={draft.description} onChange={(e) => patch("description", e.target.value)} /></label>
          <label className="text-sm">Texto alternativo da imagem<input className={fieldClass()} value={draft.imageAlt} onChange={(e) => patch("imageAlt", e.target.value)} /></label>
          <label className="text-sm">Cor de destaque<input className={fieldClass()} type="color" value={draft.accent} onChange={(e) => patch("accent", e.target.value)} /></label>
          <label className="text-sm">Ordem de exibição<input className={fieldClass()} type="number" value={draft.sortOrder} onChange={(e) => patch("sortOrder", Number(e.target.value))} /></label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-white/10 px-3 py-2.5 text-sm"><input type="checkbox" checked={draft.enabled} onChange={(e) => patch("enabled", e.target.checked)} /> Visível na loja</label>
          {draft.image && <img src={draft.image} alt={draft.imageAlt} className="size-24 rounded-xl bg-white/5 object-contain" />}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-sm text-[#ffc81e]"><ImagePlus size={18} /> Enviar imagem principal<input className="sr-only" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void onUpload(e.target.files[0], (url) => patch("image", url), setError)} /></label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-sm text-[#ffc81e]"><Upload size={18} /> Adicionar fotos à galeria<input className="sr-only" type="file" accept="image/*" multiple onChange={(e) => { const files = Array.from(e.target.files ?? []); void Promise.all(files.map((file) => uploadImage(file))).then((urls) => patch("gallery", [...draft.gallery, ...urls])).catch((uploadError: unknown) => setError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar imagem.")) }} /></label>
          {draft.gallery.length > 0 && <div className="flex flex-wrap gap-2 sm:col-span-2">{draft.gallery.map((image, index) => <button key={`${image}-${index}`} type="button" title="Remover da galeria" onClick={() => patch("gallery", draft.gallery.filter((_, i) => i !== index))}><img src={image} alt="" className="size-16 rounded-lg object-cover ring-1 ring-white/20" /></button>)}</div>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><Button type="button" onClick={onClose} className="border border-white/20">Cancelar</Button><Button type="submit" className="bg-[#ffc81e] text-[#0b1030]"><Check size={17} /> Aplicar</Button></div>
      </form>
    </div>
  )
}

async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase não está configurado.")
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.")
  if (file.size > 10 * 1024 * 1024) throw new Error("A imagem deve ter até 10 MB.")
  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "img"
  const path = `catalog/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from("store-images").upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(`Falha no envio: ${error.message}`)
  return supabase.storage.from("store-images").getPublicUrl(path).data.publicUrl
}

async function onUpload(file: File, setUrl: (url: string) => void, setError: (message: string) => void) {
  try {
    setUrl(await uploadImage(file))
  } catch (error) {
    setError(error instanceof Error ? error.message : "Falha ao enviar imagem.")
  }
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [authorizationChecked, setAuthorizationChecked] = useState(false)
  const [view, setView] = useState<View>("overview")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [banners, setBanners] = useState<StoreBanner[]>([])
  const [settings, setSettings] = useState(defaultSettings)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [backupMessage, setBackupMessage] = useState("")

  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true)
      return
    }
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (!currentSession) {
        setAuthorized(false)
        setAuthorizationChecked(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const client = supabase
    if (!session || !client) return
    let active = true
    void client.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data, error: authorizationError }) => {
      if (!active) return
      if (authorizationError) {
        setError(`Falha ao verificar autorização: ${authorizationError.message}`)
        setAuthorized(false)
      } else {
        setAuthorized(Boolean(data))
      }
      setAuthorizationChecked(true)
    })
    return () => { active = false }
  }, [session])

  useEffect(() => {
    const client = supabase
    if (!authorized || !client) return
    let active = true
    const load = async () => {
      const [productResult, bannerResult, settingsResult] = await Promise.all([
        client.from("products").select("*").order("sort_order"),
        client.from("banners").select("*").order("sort_order"),
        client.from("store_settings").select("*").eq("id", 1).maybeSingle(),
      ])
      if (!active) return
      const failure = productResult.error || bannerResult.error || settingsResult.error
      if (failure) {
        setError(`Falha ao carregar os dados: ${failure.message}`)
        return
      }
      if (productResult.data?.length) setProducts(productResult.data.map((row) => mapProduct(row as Record<string, unknown>)))
      else setProducts(initialProducts)
      setBanners((bannerResult.data ?? []) as StoreBanner[])
      if (settingsResult.data?.settings && typeof settingsResult.data.settings === "object") {
        setSettings({ ...defaultSettings, ...settingsResult.data.settings })
      }
    }
    void load()
    return () => { active = false }
  }, [authorized])

  const activeCount = products.filter((product) => product.enabled).length
  const categories = useMemo(() => new Set(products.map((product) => product.category.trim()).filter(Boolean)).size, [products])
  const markDirty = () => { setDirty(true); setNotice(""); setError("") }

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o painel.")
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) throw new Error(loginError.message)
  }

  const publish = async () => {
    if (!supabase) return
    setBusy(true)
    setError("")
    setNotice("")
    const { error: publishError } = await supabase.rpc("publish_store_content", {
      p_products: products.map(toRow),
      p_settings: { ...settings, catalogInitialized: true },
      p_banners: banners,
    })
    setBusy(false)
    if (publishError) {
      setError(`Não foi possível publicar. Nenhuma alteração foi aplicada: ${publishError.message}`)
      return
    }
    setDirty(false)
    setNotice("Alterações publicadas. A vitrine recebe a atualização em tempo real ou em até 30 segundos.")
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ version: 1, products }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `bolachas-maragogi-produtos-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file?: File) => {
    if (!file) return
    setError("")
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 || !("products" in parsed) || !Array.isArray(parsed.products)) throw new Error("Formato de backup inválido.")
      const seen = new Set<string>()
      const imported = parsed.products.map((item: unknown, index: number) => {
        if (!item || typeof item !== "object") throw new Error(`Produto ${index + 1} inválido.`)
        const row = item as Partial<Product>
        if (typeof row.id !== "string" || !row.id || seen.has(row.id)) throw new Error(`ID ausente ou duplicado no produto ${index + 1}.`)
        seen.add(row.id)
        if (typeof row.flavor !== "string" || typeof row.enabled !== "boolean" || typeof row.description !== "string" || typeof row.accent !== "string") throw new Error(`Campos obrigatórios inválidos no produto ${index + 1}.`)
        if (row.weightGrams !== null && (typeof row.weightGrams !== "number" || row.weightGrams <= 0)) throw new Error(`Peso inválido no produto ${index + 1}.`)
        if (row.price !== null && (typeof row.price !== "number" || row.price < 0)) throw new Error(`Preço inválido no produto ${index + 1}.`)
        if (!Array.isArray(row.gallery) || row.gallery.some((image) => typeof image !== "string")) throw new Error(`Galeria inválida no produto ${index + 1}.`)
        return { ...emptyProduct(index), ...row } as Product
      })
      setProducts(imported)
      markDirty()
      setNotice(`${imported.length} produtos importados como rascunho. Publique para aplicar.`)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Não foi possível importar o arquivo.")
    }
  }

  if (!supabaseConfigured) return <main className="grid min-h-screen place-items-center bg-[#0b1030] p-6 text-[#fff4d6]"><div className="max-w-xl rounded-3xl bg-[#141b4a] p-8"><h1 className="font-display text-3xl font-extrabold">Supabase não configurado</h1><p className="mt-3 text-[#c9c3a8]">Crie um arquivo <code>.env.local</code> com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>, configure o schema SQL e reinicie o Vite.</p></div></main>
  if (!authChecked) return <main className="grid min-h-screen place-items-center bg-[#0b1030] text-[#fff4d6]">Verificando sessão...</main>
  if (!session) return <AdminLogin onLogin={login} />
  if (!authorizationChecked) return <main className="grid min-h-screen place-items-center bg-[#0b1030] text-[#fff4d6]">Verificando autorização...</main>
  if (!authorized) return <main className="grid min-h-screen place-items-center bg-[#0b1030] px-5 text-[#fff4d6]"><div className="max-w-lg rounded-3xl bg-[#141b4a] p-8 text-center"><ShieldCheck size={42} className="mx-auto text-[#ffc81e]" /><h1 className="mt-4 font-display text-2xl font-extrabold">Acesso não autorizado</h1><p className="mt-2 text-sm text-[#c9c3a8]">{error || "Esta conta não está autorizada como administradora. Peça a um responsável para adicioná-la à allowlist do Supabase."}</p><Button onClick={() => void supabase?.auth.signOut()} className="mt-6 border border-white/20">Sair</Button></div></main>

  const nav: { id: View; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Visão geral", icon: <BarChart3 size={18} /> },
    { id: "products", label: "Produtos", icon: <Package size={18} /> },
    { id: "images", label: "Imagens", icon: <ImagePlus size={18} /> },
    { id: "banners", label: "Banners", icon: <Archive size={18} /> },
    { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
    { id: "backup", label: "Backup", icon: <ArrowDownToLine size={18} /> },
  ]

  const addBanner = () => {
    setBanners((current) => [...current, { id: crypto.randomUUID(), title: "", image: "", href: "", enabled: true, sortOrder: current.length }])
    markDirty()
  }

  return (
    <div className="min-h-screen bg-[#0b1030] text-[#fff4d6] md:flex">
      <aside className="border-b border-white/10 bg-[#10163d] p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
        <a href="/" className="font-display text-lg font-extrabold uppercase">Bolachas <span className="text-[#ffc81e]">Maragogi</span></a>
        <p className="mt-1 text-xs text-[#c9c3a8]">Painel administrativo</p>
        <nav className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-1">
          {nav.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-xs font-semibold sm:text-sm ${view === item.id ? "bg-[#ffc81e] text-[#0b1030]" : "text-[#c9c3a8] hover:bg-white/5 hover:text-[#fff4d6]"}`}>{item.icon}<span>{item.label}</span></button>)}
        </nav>
        <button onClick={() => void supabase?.auth.signOut()} className="mt-4 flex min-h-11 w-full items-center gap-2 px-3 text-sm text-[#c9c3a8] hover:text-white"><LogOut size={17} /> Sair</button>
        <a href="/" className="mt-2 block px-3 py-2 text-sm text-[#ffc81e]">← Ver loja pública</a>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-10">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f26b21]">Desde 1950</p><h1 className="mt-1 font-display text-3xl font-extrabold">{nav.find((item) => item.id === view)?.label}</h1></div>
          <Button onClick={() => void publish()} disabled={!dirty || busy} className="bg-[#ffc81e] text-[#0b1030]"><Save size={17} />{busy ? "Publicando..." : "Salvar e publicar"}</Button>
        </header>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-3 text-sm text-emerald-200">{notice}</p>}
        {dirty && <p className="mb-4 text-sm text-[#ffc81e]">Você tem alterações não publicadas.</p>}

        {view === "overview" && <section><div className="grid gap-4 sm:grid-cols-3">{[[<Package key="p" />, "Produtos cadastrados", products.length], [<Check key="c" />, "Produtos ativos", activeCount], [<ChevronDown key="d" />, "Categorias", categories]].map(([icon, label, value]) => <article key={String(label)} className="rounded-2xl border border-white/10 bg-[#141b4a] p-5"><div className="flex items-center justify-between text-[#ffc81e]">{icon}<span className="text-3xl font-extrabold text-[#fff4d6]">{value}</span></div><p className="mt-4 text-sm text-[#c9c3a8]">{label}</p></article>)}</div><div className="mt-6 rounded-2xl border border-white/10 bg-[#141b4a] p-5"><h2 className="font-display text-xl font-extrabold">Prévia da vitrine</h2><p className="mt-1 text-sm text-[#c9c3a8]">Somente produtos ativos aparecem no site e no carrossel.</p><div className="mt-4 flex flex-wrap gap-3">{products.filter((product) => product.enabled).sort((a, b) => a.sortOrder - b.sortOrder).map((product) => <span key={product.id} className="rounded-full bg-[#0b1030] px-4 py-2 text-sm">{product.flavor}{product.price === null ? " · Consulte o valor" : ` · ${product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}</span>)}</div><a href="/#produtos" className="mt-5 inline-block text-sm font-bold text-[#ffc81e]">Abrir loja →</a></div></section>}

        {view === "products" && <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#c9c3a8]">Nome, categoria, preço, peso, visibilidade e ordem. Valores vazios continuam sem informação comercial.</p><Button onClick={() => setEditingProduct(emptyProduct(products.length))} className="bg-[#ffc81e] text-[#0b1030]"><Plus size={17} /> Novo produto</Button></div><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#141b4a] text-[#c9c3a8]"><tr>{["Produto", "Categoria", "Peso", "Preço", "Status", "Ordem", ""].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{[...products].sort((a, b) => a.sortOrder - b.sortOrder).map((product) => <tr key={product.id} className="border-t border-white/10"><td className="px-4 py-3 font-bold">{product.flavor}</td><td className="px-4 py-3">{product.category || "—"}</td><td className="px-4 py-3">{product.weightGrams ? `${product.weightGrams} g` : "—"}</td><td className="px-4 py-3">{product.price === null ? "Consulte o valor" : product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td className="px-4 py-3"><button onClick={() => { setProducts((current) => current.map((item) => item.id === product.id ? { ...item, enabled: !item.enabled } : item)); markDirty() }} className={`rounded-full px-3 py-1 text-xs font-bold ${product.enabled ? "bg-emerald-900 text-emerald-200" : "bg-white/10 text-[#c9c3a8]"}`}>{product.enabled ? "Ativo" : "Inativo"}</button></td><td className="px-4 py-3">{product.sortOrder}</td><td className="px-4 py-3"><div className="flex gap-2"><Button onClick={() => setEditingProduct(product)} className="border border-white/15 px-3">Editar</Button><Button onClick={() => { if (window.confirm(`Excluir ${product.flavor}?`)) { setProducts((current) => current.filter((item) => item.id !== product.id)); markDirty() } }} aria-label={`Excluir ${product.flavor}`} className="border border-red-300/20 px-3 text-red-300"><Trash2 size={16} /></Button></div></td></tr>)}</tbody></table></div></section>}

        {view === "images" && <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="rounded-2xl border border-white/10 bg-[#141b4a] p-4"><div className="grid aspect-square place-items-center rounded-xl bg-[#0b1030]">{product.image ? <img src={product.image} alt={product.imageAlt} className="size-full object-contain" /> : <span className="text-sm text-[#c9c3a8]">Sem foto</span>}</div><h2 className="mt-3 font-bold">{product.flavor || "Produto sem nome"}</h2><label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-sm text-[#ffc81e]"><Upload size={16} /> Enviar/substituir<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file, (url) => { setProducts((current) => current.map((item) => item.id === product.id ? { ...item, image: url } : item)); markDirty() }, setError) }} /></label><p className="mt-3 text-xs text-[#c9c3a8]">Galeria: {product.gallery.length} foto(s). Para editar galeria e texto alternativo, abra o editor do produto.</p><Button onClick={() => setEditingProduct(product)} className="mt-2 border border-white/15">Editar galeria</Button></article>)}</section>}

        {view === "banners" && <section><div className="mb-4 flex justify-end"><Button onClick={addBanner} className="bg-[#ffc81e] text-[#0b1030]"><Plus size={17} /> Adicionar banner</Button></div><div className="grid gap-4 lg:grid-cols-2">{banners.map((banner, index) => <article key={banner.id} className="rounded-2xl border border-white/10 bg-[#141b4a] p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Banner {index + 1}</h2><Button onClick={() => { setBanners((current) => current.filter((item) => item.id !== banner.id)); markDirty() }} className="px-2 text-red-300"><Trash2 size={16} /></Button></div>{banner.image && <img src={banner.image} alt={banner.title} className="mt-3 max-h-48 w-full rounded-xl object-cover" />}<label className="mt-3 block text-sm">Título<input className={fieldClass()} value={banner.title} onChange={(e) => { setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, title: e.target.value } : item)); markDirty() }} /></label><label className="mt-3 block text-sm">Link (opcional)<input className={fieldClass()} type="url" value={banner.href} onChange={(e) => { setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, href: e.target.value } : item)); markDirty() }} /></label><label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#ffc81e]"><Upload size={16} /> Enviar imagem<input className="sr-only" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file, (url) => { setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, image: url } : item)); markDirty() }, setError) }} /></label><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={banner.enabled} onChange={(e) => { setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, enabled: e.target.checked } : item)); markDirty() }} /> Publicado na vitrine</label></article>)}</div><p className="mt-4 text-sm text-[#c9c3a8]">Os banners publicados ficam disponíveis no banco para futuras seções do site. Os banners atuais do hero e da tradição também podem ser atualizados em Configurações.</p></section>}

        {view === "settings" && <section className="max-w-2xl rounded-2xl border border-white/10 bg-[#141b4a] p-5"><h2 className="font-display text-xl font-extrabold">Identidade e contato</h2><label className="mt-4 block text-sm">Slogan<input className={fieldClass()} value={settings.brandSlogan} onChange={(e) => { setSettings((current) => ({ ...current, brandSlogan: e.target.value })); markDirty() }} /></label><label className="mt-4 block text-sm">WhatsApp (DDI + DDD + número)<input className={fieldClass()} inputMode="numeric" value={settings.whatsappNumber} onChange={(e) => { setSettings((current) => ({ ...current, whatsappNumber: e.target.value })); markDirty() }} placeholder="Ex.: 5582..." /></label>{(["heroImage", "traditionImage"] as const).map((key) => <div key={key} className="mt-5"><p className="text-sm">{key === "heroImage" ? "Imagem principal do site" : "Imagem da seção Desde 1950"}</p>{settings[key] && <img src={settings[key]} alt="" className="mt-2 max-h-48 rounded-xl object-cover" />}<label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#ffc81e]"><Upload size={16} /> Substituir imagem<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file, (url) => { setSettings((current) => ({ ...current, [key]: url })); markDirty() }, setError) }} /></label></div>)}<p className="mt-5 text-xs text-[#c9c3a8]">Não alteramos "Desde 1950" nem textos comerciais da marca por padrão.</p></section>}

        {view === "backup" && <section className="max-w-2xl space-y-4"><article className="rounded-2xl border border-white/10 bg-[#141b4a] p-5"><h2 className="font-display text-xl font-extrabold">Backup dos produtos</h2><p className="mt-2 text-sm text-[#c9c3a8]">Exporta o catálogo em JSON. Importar cria um rascunho validado; os dados só mudam no banco ao publicar.</p><div className="mt-4 flex flex-wrap gap-3"><Button onClick={exportJson} className="bg-[#ffc81e] text-[#0b1030]"><ArrowDownToLine size={17} /> Exportar JSON</Button><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold">Importar JSON<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void importJson(e.target.files?.[0])} /></label></div></article><article className="rounded-2xl border border-white/10 bg-[#141b4a] p-5"><h2 className="font-display text-xl font-extrabold">Cópia ZIP do projeto</h2><p className="mt-2 text-sm text-[#c9c3a8]">Por segurança, o navegador hospedado não pode ler os arquivos-fonte do servidor. No diretório local do projeto, execute <code className="rounded bg-[#0b1030] px-1.5 py-1 text-[#ffc81e]">npm run backup:zip</code>. O arquivo criado exclui variáveis de ambiente, dependências e builds.</p><Button onClick={() => { navigator.clipboard.writeText("npm run backup:zip").then(() => setBackupMessage("Comando copiado. Execute-o no diretório local do projeto.")).catch(() => setBackupMessage("Execute npm run backup:zip no diretório local do projeto.")) }} className="mt-4 border border-white/20">Copiar comando</Button>{backupMessage && <p role="status" className="mt-2 text-sm text-emerald-200">{backupMessage}</p>}</article></section>}
      </main>
      {editingProduct && <ProductEditor product={editingProduct} onClose={() => setEditingProduct(null)} onSave={(product) => { setProducts((current) => current.some((item) => item.id === product.id) ? current.map((item) => item.id === product.id ? product : item) : [...current, product]); markDirty() }} />}
    </div>
  )
}
