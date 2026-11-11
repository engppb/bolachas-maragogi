# Pendências para personalizar

## Fotografias (prioridade máxima)
- [ ] **Recortes individuais** (PNG/WebP, fundo transparente, ~1000×1000 px, pacote de frente, borda limpa) de **Salgada, Doce e Canela**. Hoje o carrossel e os cards mostram o placeholder "FOTO PENDENTE". As fotos enviadas não servem como recorte: na foto da linha os pacotes se sobrepõem (Doce e o 4º ficam parcialmente cobertos) e há ícone de captura do Instagram; a foto da Canela tem mão, fundo desfocado e corte lateral.
- [ ] Foto original de alta resolução da linha completa (substitui `public/images/banners/linha-bolachas-original.jpg`, usada no hero; a base da imagem é recortada pelo layout).
- [ ] Foto de fábrica/produção ou da marca (substitui a foto da Canela em loja, usada na seção Tradição).
- [ ] Logotipo oficial em SVG/PNG (`public/images/brand`). O cabeçalho usa texto + ícone provisório de veleiro.

## Produtos (`src/data/products.ts` / painel `/admin`)
- [ ] Preços de cada sabor (hoje: "Consulte o valor").
- [ ] Descrições oficiais e lista de ingredientes/alergênicos conforme o rótulo (as descrições atuais usam só nome, peso e "desde 1950").
- [ ] 4º pacote da foto da linha: nome do sabor e peso (rótulo ilegível). Está desativado (`enabled: false`).
- [ ] Confirmar pesos: Salgada 400 g, Doce 400 g, Canela 300 g (lidos das embalagens).

Após configurar o Supabase, faça essas alterações no painel administrativo e publique para atualizar a loja. `src/data/products.ts` passa a servir somente como catálogo inicial/fallback.

## Loja (`src/config/store.ts`)
- [ ] Número de WhatsApp (sem ele, os botões levam à seção "Como comprar").
- [ ] Avaliação e curtidas **reais** do carrossel (hoje 0.0 e 0 likes; nada foi inventado).
- [ ] Link de vídeo para "Play video" (sem ele, leva à seção Tradição).
- [ ] Instagram, e-mail, endereço, cidade, horário e CNPJ do rodapé.
- [ ] Regras reais de pagamento, entrega e retirada (passo 3 de "Como comprar" é genérico).

## Decisões em aberto
- [ ] Traduzir os 5 textos em inglês do carrossel exige alterar o componente original. Mantidos como estão, conforme sua instrução.
- [ ] Os botões Search e Menu do carrossel não têm função (limitação do componente original).
- [ ] Textos pequenos (10–12,5 px) e alvos de toque de 34–36 px do carrossel no celular estão abaixo do recomendado (limitação do componente original).
