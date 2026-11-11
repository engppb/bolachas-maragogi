# Bolachas Maragogi — Loja virtual

React + TypeScript + Vite + Tailwind CSS v4, com o carrossel orbital original (GSAP + ScrollTrigger), Motion e Lucide.

> **Status:** os arquivos foram criados, mas o projeto **ainda não foi instalado, compilado nem testado**
> (o ambiente de criação não tinha acesso à rede). Rode `npm run build` para validar antes de publicar.

## Executar no Windows (Warp / PowerShell)

Requisito: Node.js 20 LTS ou superior (`node -v`).

```powershell
Expand-Archive .\bolachas-maragogi.zip -DestinationPath .
cd .\bolachas-maragogi
npm install
npm run dev
```

Abra o endereço mostrado (normalmente http://localhost:5173). Para validar tipos e gerar a versão final: `npm run build`.

## Onde editar

| O que | Arquivo |
|---|---|
| Produtos, pesos, preços, descrições, fotos | `src/data/products.ts` |
| WhatsApp, textos comerciais, contato, vídeo | `src/config/store.ts` |
| Cores e fontes | `src/index.css` (bloco `@theme`) |
| Fotos | `public/images/products`, `brand`, `banners` |

Pendências comerciais: veja `PENDENCIAS.md`.

## Componente original

`src/components/ui/dish-orbit-carousel.tsx` foi extraído do TXT fornecido (linhas 15–596) por script, sem edição.
Única diferença: finais de linha CRLF convertidos para LF e linhas em branco finais removidas. **Não edite esse arquivo.**
A loja se integra por props (`dishes`, `onOrder`, `onPlay`) em `src/components/store/Showcase.tsx`.
Os textos internos do componente continuam em inglês (Play video, Order food, Overview, Ingredients, likes).

Regras de layout para não quebrar o carrossel: nenhum ancestral pode ter `overflow`, e o cabeçalho não pode ser `fixed` sobre ele.
