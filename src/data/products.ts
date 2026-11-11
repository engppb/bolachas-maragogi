/**
 * CATÁLOGO — fonte única dos produtos. Edite aqui nomes, pesos, preços, descrições e fotos.
 * image: caminho de um recorte PNG/WebP com fundo transparente (ex.: "/images/products/salgada.webp").
 *        null = usa o placeholder "FOTO PENDENTE".
 * price: número em reais (ex.: 9.9) ou null = "Consulte o valor".
 * enabled: false esconde o produto do site inteiro.
 */
export type Product = {
  id: string
  flavor: string
  weightGrams: number | null
  price: number | null
  description: string
  image: string | null
  imageAlt: string
  accent: string
  enabled: boolean
  category: string
  sortOrder: number
  gallery: string[]
}

export const products: Product[] = [
  {
    id: "salgada",
    flavor: "Salgada",
    weightGrams: 400,
    price: null, // PENDENTE
    description: "Bolacha Maragogi sabor salgada, pacote de 400 g. Tradição e qualidade desde 1950.", // PENDENTE: texto oficial
    image: null, // PENDENTE: recorte da embalagem Salgada
    imageAlt: "Pacote de Bolachas Maragogi sabor salgada, 400 g",
    accent: "#3b52c4",
    enabled: true,
    category: "",
    sortOrder: 0,
    gallery: [],
  },
  {
    id: "doce",
    flavor: "Doce",
    weightGrams: 400,
    price: null, // PENDENTE
    description: "Bolacha Maragogi sabor doce, pacote de 400 g. Tradição e qualidade desde 1950.", // PENDENTE: texto oficial
    image: null, // PENDENTE: foto individual da embalagem Doce
    imageAlt: "Pacote de Bolachas Maragogi sabor doce, 400 g",
    accent: "#e8541e",
    enabled: true,
    category: "",
    sortOrder: 1,
    gallery: [],
  },
  {
    id: "canela",
    flavor: "Canela",
    weightGrams: 300,
    price: null, // PENDENTE
    description: "Bolacha Maragogi sabor canela, pacote de 300 g. Tradição e qualidade desde 1950.", // PENDENTE: texto oficial
    image: null, // PENDENTE: foto individual da embalagem Canela (sem mão, sem corte)
    imageAlt: "Pacote de Bolachas Maragogi sabor canela, 300 g",
    accent: "#8a3b1f",
    enabled: true,
    category: "",
    sortOrder: 2,
    gallery: [],
  },
  // 4º pacote aparece na foto da linha, mas o nome do sabor e o peso estão ilegíveis. Preencha e mude enabled.
  {
    id: "quarto-sabor",
    flavor: "A confirmar",
    weightGrams: null,
    price: null,
    description: "",
    image: null,
    imageAlt: "",
    accent: "#b58a12",
    enabled: false,
    category: "",
    sortOrder: 3,
    gallery: [],
  },
]

export const activeProducts = products.filter((p) => p.enabled)
export const productImage = (p: Product) => p.image ?? `/images/products/placeholder-${p.id}.svg`
export const formatPrice = (p: Product) =>
  p.price === null ? "Consulte o valor" : p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
export const formatWeight = (p: Product) => (p.weightGrams ? `${p.weightGrams} g` : "")
