# GeekHub Site

Aplicação web do Projeto Integrador **GeekHub** (Grupo **GuildCode** — UNIFIO), um marketplace para compra e venda de produtos geek e colecionáveis.

O frontend gerencia catálogo com busca e filtragem, perfil público de vendedores, autenticação JWT e cadastro, gestão completa de anúncios e categorias, carrinho de compras, ciclo ponta a ponta de pedidos com avaliações pós-compra e dashboard operacional administrativo.

---

## Link da Aplicação Publicada

- **Aplicação web (Vercel)**: <https://geekhub-site.vercel.app>
- **API REST em produção (Render)**: <https://geekhub-api.onrender.com> ([Swagger UI](https://geekhub-api.onrender.com/swagger-ui.html))
- **Código-fonte frontend (`geekhub-site`)**: <https://github.com/GuildCodeUnifio/geekhub-site>
- **Código-fonte backend (`geekhub-api`)**: <https://github.com/GuildCodeUnifio/geekhub-api>

---

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Linguagem | TypeScript `6.0` |
| Framework e Arquitetura | Angular `22.2` (`NgModules`, `standalone: false`, roteamento sem SSR/SSG) |
| Interface e Componentes | Angular Material `22.2` + Angular CDK |
| Reatividade e Estado | RxJS `7.8` + Angular Signals |
| Integração e Fallback | `HttpClient` + Interceptor JWT / fallback automático local (`localStorage`) |
| Testes Unitários | Vitest `5.0` + `jsdom` |
| Ambiente e Execução | Node.js `22` + npm `10.9` + Dev Container |

---

## Como Executar

### Opção 1: Dev Container / GitHub Codespaces (Recomendado)

1. Abra a pasta `geekhub-site` no VS Code com a extensão **Dev Containers** (ou inicie um GitHub Codespace).
2. Selecione **Reopen in Container**. O ambiente (`.devcontainer/devcontainer.json`) utiliza **Node.js 22**, instala o Angular CLI e executa `npm --prefix geekhub ci`.
3. Entre na pasta `geekhub/` e inicie a aplicação:
   ```bash
   cd geekhub
   npm start
   ```

### Opção 2: Execução Local (Windows / Linux)

1. Instale **Node.js 22+** e **npm**.
2. Entre na pasta `geekhub/`, instale as dependências e inicie o servidor de desenvolvimento:
   ```bash
   cd geekhub
   npm ci
   npm start
   ```

A aplicação inicia em `http://localhost:4200/`.

### Opção 3: Deploy em Nuvem (Vercel)

O projeto possui [vercel.json](geekhub/vercel.json) e suporte a configuração de ambiente por variáveis para publicação SPA na Vercel:

- **Diretório da aplicação**: `geekhub/` (definido via `working-directory` no workflow; *Root Directory* padrão no painel da Vercel)
- **Build Command**: `npm run build:vercel` (definido em `geekhub/vercel.json`)
- **Output Directory**: `dist/geekhub/browser`
- **Variável opcional (`GEEKHUB_API_URL`)**: URL pública do backend no Render (padrão em produção: `https://geekhub-api.onrender.com` definido em [environment.prod.ts](geekhub/src/environments/environment.prod.ts)).
- **Deploy automático (CI/CD)**: workflow [.github/workflows/deploy-vercel.yml](.github/workflows/deploy-vercel.yml) executa os testes Vitest e publica automaticamente em <https://geekhub-site.vercel.app> a cada push na branch `main`.

### Integração com a API e Fallback Automático para Dados Mockados

Por padrão, [CONFIGURACAO_API.fonteDados](geekhub/src/app/api/configuracao-api.ts) utiliza o modo **`'auto'`**:

1. O frontend tenta consumir o **geekhub-api** em `CONFIGURACAO_API.urlBase` (`http://localhost:8080` em desenvolvimento local e `environment.prod.ts` em produção).
2. Se a API estiver inacessível, hibernando no Render ou retornar erro de indisponibilidade (`status === 0`, `502`, `503`, `504` ou timeout acima de `6s`), o serviço [DadosGeekhub](geekhub/src/app/api/dados-geekhub.ts) alterna **automaticamente** em tempo de execução para os dados locais mantidos em `localStorage`, permitindo executar todo o sistema ponta a ponta mesmo durante o *cold start* do backend.
3. Erros de regra de negócio retornados pela API (`400`, `401`, `403`, `404`, `409`, `500`) são exibidos normalmente na interface sem mascaramento.

---

## Credenciais de Acesso para Avaliação

### Modo Integrado com `geekhub-api`

| Perfil | E-mail | Senha | Permissões |
| --- | --- | --- | --- |
| **Administrador** | `admin@geekhub.com` | `123456` | `ADMIN` e `USUARIO` (inclui `/dashboard`, `/categorias` e `/minha-conta/usuarios`) |
| **Usuário Comum** | `usuario@geekhub.com` | `123456` | `USUARIO` |
| **Vendedor (`V2`)** | `vendedor@geekhub.com` | `123456` | `USUARIO` |

### Modo Demonstração / Fallback Local (sem API no ar)

| Perfil | E-mail | Senha | Permissões |
| --- | --- | --- | --- |
| **Administrador / Comprador** | `demo@geekhub.com` *(ou `admin@geekhub.com`)* | `123456` | Acesso total (Catálogo, Meus Anúncios, Categorias, Usuários, Vendas, Compras, Dashboard) |
| **Usuário Comum** | `teste@geekhub.com` *(ou `usuario@geekhub.com` com senha `123456`)* | `teste123` | Comprador e Vendedor padrão |

### Roteiro Sugerido de Teste Ponta a Ponta

1. Entre em `/entrar` com `admin@geekhub.com` / `123456` (com API ativa) ou `demo@geekhub.com` / `123456` (em fallback local).
2. Abra **Dashboard** (`/dashboard`) no menu lateral (restrito a administradores) para conferir os 4 KPIs operacionais iniciais.
3. Em **Meus anúncios** (`/meus-anuncios`), crie, edite ou exclua anúncios; em **Categorias** (`/categorias`), gerencie categorias do catálogo.
4. No **Catálogo** (`/`), filtre ou pesquise um item, adicione ao **Carrinho** (`/carrinho`) e finalize a compra em **Revisar pedido** (`/pedidos/revisar`).
5. Acompanhe o pedido em **Minhas compras** (`/pedidos`), avance o estado (`Confirmar` → `Enviar` → `Concluir`) em **Minhas vendas** (`/pedidos/vendas`), avalie a compra em `/pedidos/:id` e volte ao `/dashboard` para conferir os indicadores atualizados.

---

## Rotas e Funcionalidades Principais

| Recurso / Rotas | Acesso | Funcionalidades |
| --- | --- | --- |
| Catálogo e Vendedores (`/`, `/produtos/:id`, `/vendedores/:id`) | Público | Busca textual, filtro por categoria, paginação, galeria e reputação do vendedor |
| Autenticação (`/entrar`, `/cadastro`) | Público | Login com e-mail/senha, criação de conta e redirecionamento pós-login |
| Conta e Usuários (`/minha-conta/perfil`, `/minha-conta/usuarios`) | Autenticado / `ADMIN` | Edição de perfil/foto e listagem administrativa de usuários e permissões |
| Anúncios (`/meus-anuncios`, `/meus-anuncios/novo`, `/meus-anuncios/:id/editar`) | Autenticado (`ADMIN` vê todos) | CRUD completo de anúncios, controle de disponibilidade/estoque e remoção |
| Categorias (`/categorias`) | `ADMIN` | CRUD completo de categorias, ativação/inativação e proteção contra vínculo |
| Carrinho, Pedidos e Avaliações (`/carrinho`, `/pedidos/revisar`, `/pedidos`, `/pedidos/vendas`, `/pedidos/:id`) | Autenticado | Carrinho com limpeza completa, revisão, criação de pedido, avanço/cancelamento e avaliação |
| Dashboard Operacional (`/dashboard`) | `ADMIN` | KPIs consolidados (`GET /dashboard` com fallback local), distribuições e pedidos recentes |

---

## Documentação e Diagramas

- **Diagrama de Classes (Documentação)**: [docs/diagrama-classes.md](docs/diagrama-classes.md)
- **Diagrama de Classes (PNG)**: [docs/diagrama-classes.png](docs/diagrama-classes.png)
- **Protótipos de Tela**: [prototipos-telas/](prototipos-telas/)
- **Backend REST e Swagger/Postman**: <https://github.com/GuildCodeUnifio/geekhub-api>

---

## Testes e Build

Os testes unitários usam **Vitest** (`jsdom`) com cobertura dos fluxos em modo mock, integração com a API (`HttpTestingController`) e fallback automático em `status === 0`. Execute dentro da pasta `geekhub/`:

```bash
cd geekhub
npm test -- --watch=false
```

Suíte atual: **`32` arquivos e `153` testes** passando sem falhas.

Para gerar o bundle estático de produção (saída em `geekhub/dist/geekhub/browser`):

```bash
cd geekhub
npm run build
```

---

## Integrantes (Grupo GuildCode)

| Nome Completo | RA | GitHub |
| --- | --- | --- |
| Bryan Alvarenga | `272426` | [@bryan-coursework](https://github.com/bryan-coursework) |
| Igor Bassetto Menon | `274582` | [@Igor-menon](https://github.com/Igor-menon) |
| Juan Pedrozo | `273889` | [@juanpedrozo](https://github.com/juanpedrozo) |
| Kauã Gustavo da Fonseca Rodrigues | `273722` | [@uaikauaa](https://github.com/uaikauaa) |
| Rafael Dias Garcia | `272207` | [@diasgarcia](https://github.com/diasgarcia) |
| Vitor Yago Ferreira dos Santos | `272261` | [@Cuidoka](https://github.com/Cuidoka) |

---

## Contribuição e Licença

- Guia de contribuição e fluxo Git: [CONTRIBUTING.md](CONTRIBUTING.md)
- Licença: [GNU General Public License v3.0 (GPL-3.0)](LICENSE)
