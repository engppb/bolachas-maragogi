# Bolachas Maragogi — Loja virtual

React + TypeScript + Vite + Tailwind CSS v4, com o carrossel orbital original (GSAP + ScrollTrigger), Motion, Lucide e painel administrativo integrado ao Supabase.

## Executar localmente

Requisito: Node.js 20 LTS ou superior.

```powershell
npm install
npm run dev
```

O site público abre em `http://localhost:5173` e o painel em `http://localhost:5173/admin`.
Sem configuração do Supabase, o site usa o catálogo local e o painel informa quais variáveis faltam.

## Configuração do Supabase

1. Crie um projeto Supabase e execute [`supabase/schema.sql`](./supabase/schema.sql) no SQL Editor.
2. Em Authentication, crie manualmente cada usuário administrador (não há cadastro no painel) e desative o cadastro público.
3. Adicione a associação do administrador usando o UUID do usuário criado:

```sql
insert into public.admin_users (user_id) values ('UUID_DO_USUARIO');
```

4. Copie `.env.example` para `.env.local` e informe a URL do projeto e a chave pública (publishable/anon):

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

5. Reinicie o Vite. Faça login em `/admin` com o e-mail/senha criados no Supabase.

O SQL configura tabelas, RLS, políticas do Storage, bucket público de imagens e a função transacional de publicação. A chave `service_role` nunca é necessária no navegador e não deve ser adicionada ao `.env`. A primeira publicação usa os produtos iniciais existentes em `src/data/products.ts`, inclusive produtos desativados e campos comerciais vazios.

### Vercel

Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do projeto Vercel para cada ambiente (Production/Preview/Development) e faça um novo deploy. O [`vercel.json`](./vercel.json) reescreve `/admin` para a aplicação SPA. Configure também a URL de produção e os endereços de preview permitidos em Supabase Authentication → URL Configuration. Mantenha o cadastro público desativado; para incluir um novo administrador, crie o usuário no Supabase e adicione seu UUID a `public.admin_users`.

## Painel

- `/admin`: autenticação por senha e autorização adicional via `admin_users`.
- Produtos: criar, editar, excluir com confirmação, ativar/desativar, ordenar, organizar por categoria, editar preço/peso/descrição e manter imagem principal/galeria.
- Imagens: upload para Supabase Storage com limite de 10 MB por arquivo.
- Banners: rascunhos publicados aparecem na seção de novidades da loja; as imagens principais podem ser alteradas em Configurações.
- Configurações: slogan, WhatsApp e imagens da loja.
- Publicação: produtos, banners e configurações são gravados juntos em uma chamada transacional; os dados públicos são atualizados por Realtime e também por consulta periódica a cada 30 segundos.
- Backup: exporta/importa catálogo em JSON. A importação valida o formato e fica como rascunho até publicar.

O projeto é uma aplicação estática: o navegador hospedado não pode ler com segurança os arquivos-fonte do servidor para gerar ZIP. Para criar um ZIP do código localmente, rode `npm run backup:zip`; o script exclui `.env` e outros arquivos locais de credenciais, dependências, builds e repositórios Git.

## Onde editar os dados iniciais

| O que | Arquivo |
|---|---|
| Catálogo inicial de produtos (antes da primeira publicação) | `src/data/products.ts` |
| Textos comerciais e dados padrão da loja | `src/config/store.ts` |
| Cores e fontes | `src/index.css` (bloco `@theme`) |
| Fotos | `public/images/products`, `brand`, `banners` |

Pendências comerciais: veja `PENDENCIAS.md`.

## Build e componente original

Valide e gere a versão de produção com `npm run build`.

`src/components/ui/dish-orbit-carousel.tsx` foi extraído do TXT fornecido (linhas 15–596) por script, sem edição.
Única diferença: finais de linha CRLF convertidos para LF e linhas em branco finais removidas. **Não edite esse arquivo.**
A loja se integra por props (`dishes`, `onOrder`, `onPlay`) em `src/components/store/Showcase.tsx`.
Os textos internos do componente continuam em inglês (Play video, Order food, Overview, Ingredients, likes).

Regras de layout para não quebrar o carrossel: nenhum ancestral pode ter `overflow`, e o cabeçalho não pode ser `fixed` sobre ele.
