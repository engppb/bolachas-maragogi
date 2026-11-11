/**
 * CONFIGURAÇÕES COMERCIAIS — edite apenas este arquivo para trocar textos, contato e WhatsApp.
 * Campos vazios ("") ficam ocultos no site. Veja PENDENCIAS.md.
 */
export const store = {
  brand: {
    name: "Bolachas Maragogi",
    company: "Indústria Alimentícia Maragogi", // texto presente nas embalagens
    since: 1950,
    slogan: "Seja o que for, seja original.",
    tagline: "Qualidade e tradição.",
  },
  whatsapp: {
    /** PENDENTE: DDI + DDD + número, só dígitos. Ex.: "5582999999999" */
    number: "",
    defaultMessage: "Olá! Quero fazer um pedido de Bolachas Maragogi.",
  },
  /** PENDENTE: link do vídeo (Instagram/YouTube). Vazio = o botão "Play video" leva à seção Tradição. */
  videoUrl: "",
  contact: {
    instagram: "", // PENDENTE: URL completa
    email: "", // PENDENTE
    address: "", // PENDENTE
    city: "", // PENDENTE
    hours: "", // PENDENTE
    cnpj: "", // PENDENTE
  },
  /** PENDENTE: avaliações e curtidas REAIS. O componente original exige números; 0 = ainda não informado. */
  showcase: { rating: 0, likes: 0 },
  copy: {
    heroTitleThin: "Bolachas",
    heroTitleHeavy: "Maragogi",
    heroText: "Salgada, doce e canela. Tradição de família em cada pacote, desde 1950.",
    productsTitle: "Escolha a sua bolacha",
    productsText: "Três sabores clássicos, do jeito que a gente faz desde sempre.",
    traditionTitle: "Desde 1950",
    traditionText:
      "A Indústria Alimentícia Maragogi faz bolachas com qualidade e tradição há mais de setenta anos. Nas embalagens, a mesma promessa de sempre: seja o que for, seja original.",
    howToBuyTitle: "Como comprar",
    howToBuyText: "O pedido é simples e direto, pelo WhatsApp.",
    steps: [
      { title: "Escolha os sabores", text: "Veja a linha completa e decida quais pacotes levar." },
      { title: "Chame no WhatsApp", text: "Toque no botão e envie sua mensagem já pronta." },
      { title: "Combine e receba", text: "Confirmamos valores, pagamento e entrega ou retirada." }, // PENDENTE: confirmar regras reais
    ],
  },
}
