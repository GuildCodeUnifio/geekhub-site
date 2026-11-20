# GeekHub

Marketplace de produtos geek e colecionáveis, desenvolvido pela equipe
**GuildCode** como Projeto Integrador da UNIFIO.

A plataforma conecta compradores e vendedores com busca e filtragem no catálogo,
gestão de anúncios e categorias, carrinho de compras, acompanhamento de pedidos,
avaliação de vendedores e dashboard operacional.

---

## Link da Aplicação Publicada

- **Aplicação web (nuvem)**: _inserir aqui a URL publicada após o deploy de produção (ex.: Vercel / Netlify / Render)_
- **Código-fonte frontend**: <https://github.com/GuildCodeUnifio/geekhub-site>
- **Código-fonte backend (`geekhub-api`)**: <https://github.com/GuildCodeUnifio/geekhub-api>

---

## Funcionalidades Implementadas

- **Configuração Angular**: módulos (`NgModule`), componentes com `standalone: false`, roteamento por feature (`AppRoutingModule`) com lazy loading, **SSR/SSG desabilitado** e interface construída com **Angular Material**.
- **Catálogo e Vendedores (`/`, `/produtos/:id`, `/vendedores/:id`)**: pesquisa textual, filtro por categoria, paginação, galeria de fotos e reputação do vendedor.
- **Autenticação e Conta (`/entrar`, `/cadastro`, `/minha-conta/perfil`, `/minha-conta/usuarios`)**: login, cadastro, edição de perfil e gestão administrativa de usuários/permissões.
- **CRUD Completo de Anúncios (`/meus-anuncios`, `/meus-anuncios/novo`, `/meus-anuncios/:id/editar`)**: cadastro, edição, ativação/pausa de disponibilidade, visão administrativa e remoção.
- **CRUD Completo de Categorias (`/categorias`)**: cadastro, edição, ativação/inativação e remoção protegida (administradores).
- **Carrinho e Fluxo de Pedido (`/carrinho`, `/pedidos/revisar`, `/pedidos`, `/pedidos/vendas`, `/pedidos/:id`)**: ajuste de quantidade, limpeza completa do carrinho, revisão, criação do pedido, avanço de estado (`CRIADO -> CONFIRMADO -> ENVIADO -> CONCLUIDO`), cancelamento com estorno de estoque e avaliação pós-conclusão.
- **Dashboard Operacional (`/dashboard`)**: painel com 4 KPIs calculados dinamicamente (receita/ticket médio, total de pedidos e taxa de conclusão, anúncios ativos/estoque/categorias e nota média de avaliações), distribuição por estado e por categoria e tabela de pedidos recentes.

---

## Integração com a API e Fallback Automático para Dados Mockados

Por padrão, [`CONFIGURACAO_API.fonteDados`](geekhub/src/app/api/configuracao-api.ts) utiliza o modo **`'auto'`**:

1. O frontend tenta consumir o **geekhub-api** na URL configurada em `CONFIGURACAO_API.urlBase` (padrão local: `http://localhost:8080`).
2. Se a API não estiver acessível (`status === 0`), o serviço [`DadosGeekhub`](geekhub/src/app/api/dados-geekhub.ts) alterna **automaticamente** em tempo de execução para os dados locais mantidos no `localStorage`, permitindo testar todo o sistema mesmo sem backend ativo (ex.: deploy estático em nuvem).
3. Erros de regra de negócio retornados pela API (`400`, `401`, `403`, `404`, `409`, `500`) continuam sendo exibidos normalmente ao usuário sem mascaramento.

---

## Credenciais de Acesso para Avaliação

### Modo Demonstração / Fallback Local (sem API no ar)

| Perfil | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **Administrador / Comprador** | `demo@geekhub.com` | `123456` | Acesso total (Catálogo, Meus Anúncios, Categorias, Usuários, Vendas, Compras, Dashboard) |
| **Usuário Comum** | `teste@geekhub.com` | `teste123` | Comprador e Vendedor padrão |

### Modo Integrado com `geekhub-api`

| Perfil | E-mail | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@geekhub.com` | `123456` | `ADMIN` e `USUARIO` |
| **Usuário Comum** | `usuario@geekhub.com` | `123456` | `USUARIO` |

### Roteiro Sugerido de Teste Ponta a Ponta

1. Acesse `/dashboard` para conferir os KPIs operacionais iniciais.
2. Entre com `demo@geekhub.com` / `123456` (ou `admin@geekhub.com` se estiver com a API rodando).
3. Em **Meus anúncios** (`/meus-anuncios`), crie um novo produto ou edite/exclua anúncios existentes.
4. No **Catálogo** (`/`), abra um produto, adicione ao **Carrinho** (`/carrinho`) e avance para **Revisar pedido** (`/pedidos/revisar`) para concluir uma compra.
5. Acompanhe o pedido em **Minhas compras** (`/pedidos`), gerencie seu avanço (`Confirmar` → `Enviar` → `Concluir`) em **Minhas vendas** (`/pedidos/vendas`) e envie uma avaliação em `/pedidos/:id`.

---

## Documentação Técnica (Diagrama de Classes)

- **Documento completo em Markdown + Mermaid**: [docs/diagrama-classes.md](docs/diagrama-classes.md)
- **Diagrama vetorial (SVG)**: [docs/diagrama-classes.svg](docs/diagrama-classes.svg)

---

## Executar e Testar Localmente

Com Node.js e npm instalados, execute dentro da pasta `geekhub/`:

```bash
cd geekhub
npm ci
npm start
```

- Aplicação web: <http://localhost:4200/>
- Testes unitários (Vitest):

```bash
cd geekhub
npm test -- --watch=false
```

- Build de produção (gera `geekhub/dist/geekhub/browser`):

```bash
cd geekhub
npm run build
```

O repositório também inclui uma configuração de Dev Container em `.devcontainer/`.

## Contribuir

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para seguir o fluxo de branches da equipe.

## Licença

Este projeto é distribuído sob a GNU General Public License, versão 3
(`GPL-3.0-only`). O texto completo está em [LICENSE](LICENSE).
