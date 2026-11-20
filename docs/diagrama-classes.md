# Diagrama de Classes — GeekHub

Documentação técnica da modelagem orientada a objetos e dos relacionamentos entre as entidades de negócio do **GeekHub** (Marketplace de produtos geek e colecionáveis — Projeto Integrador UNIFIO, Grupo GuildCode).

![Diagrama de Classes do GeekHub](diagrama-classes.svg)

## Modelo de Domínio (Mermaid)

```mermaid
classDiagram
    direction LR

    class Usuario {
        -Long id
        -String nome
        -String email
        -String senha
        -String imagemPerfil
        -Boolean ativo
        -LocalDateTime criadoEm
        -List~Permissao~ permissoes
        +adicionarPermissao(Permissao permissao) void
        +isAdmin() Boolean
        +atualizarPermissaoAdmin(Boolean tornarAdmin) void
        +obterNomesPermissoes() List~String~
    }

    class Permissao {
        -Long id
        -String nome
        -Usuario usuario
    }

    class Categoria {
        -Long id
        -String nome
        -String descricao
        -Boolean ativa
        -LocalDateTime criadoEm
    }

    class Anuncio {
        -Long id
        -String nome
        -String descricao
        -BigDecimal preco
        -Integer quantidadeDisponivel
        -Boolean disponivel
        -CondicaoProduto condicao
        -ConservacaoProduto conservacao
        -Categoria categoria
        -Usuario vendedor
        -List~String~ imagens
        -LocalDateTime criadoEm
        +obterImagemPrincipal() String
        +descontarEstoque(Integer quantidade) void
        +estornarEstoque(Integer quantidade) void
    }

    class CondicaoProduto {
        <<enumeration>>
        NOVO
        USADO
    }

    class ConservacaoProduto {
        <<enumeration>>
        EXCELENTE
        BOM
        REGULAR
    }

    class ItemCarrinho {
        -Long id
        -Usuario comprador
        -Anuncio anuncio
        -Integer quantidade
        -LocalDateTime criadoEm
        +calcularSubtotal() BigDecimal
    }

    class Pedido {
        -Long id
        -Usuario comprador
        -String compradorNome
        -String compradorEmail
        -BigDecimal valorTotal
        -EstadoPedido estado
        -Boolean avaliado
        -List~ItemPedido~ itens
        -List~EventoPedido~ historico
        -LocalDateTime criadoEm
        +calcularValorTotal() void
        +registrarEvento(EstadoPedido novoEstado, LocalDateTime ocorridoEm) void
        +calcularQuantidadeItens() Integer
        +pertenceAoComprador(Long usuarioId) Boolean
        +possuiVendedor(Long vendedorId) Boolean
        +isConcluido() Boolean
        +obterVendedorId() Long
    }

    class ItemPedido {
        -Long anuncioId
        -Long vendedorId
        -String nomeProduto
        -String imagemProduto
        -BigDecimal precoUnitario
        -Integer quantidade
        -BigDecimal subtotal
    }

    class EventoPedido {
        -EstadoPedido estado
        -LocalDateTime ocorridoEm
    }

    class EstadoPedido {
        <<enumeration>>
        CRIADO
        CONFIRMADO
        ENVIADO
        CONCLUIDO
        CANCELADO
    }

    class Avaliacao {
        -Long id
        -Pedido pedido
        -Usuario autor
        -Usuario vendedor
        -Integer nota
        -String comentario
        -LocalDateTime criadoEm
        +pertenceAoAutor(Long usuarioId) Boolean
    }

    Usuario "1" *-- "0..*" Permissao : possui
    Categoria "1" <-- "0..*" Anuncio : classifica
    Usuario "1" <-- "0..*" Anuncio : anuncia
    Anuncio --> CondicaoProduto
    Anuncio --> ConservacaoProduto
    Usuario "1" <-- "0..*" ItemCarrinho : seleciona
    Anuncio "1" <-- "0..*" ItemCarrinho : referencia
    Usuario "1" <-- "0..*" Pedido : realiza
    Pedido "1" *-- "1..*" ItemPedido : contem
    Pedido "1" *-- "1..*" EventoPedido : registra
    Pedido --> EstadoPedido
    EventoPedido --> EstadoPedido
    Pedido "1" <-- "0..1" Avaliacao : origina
    Usuario "1" <-- "0..*" Avaliacao : escreve
    Usuario "1" <-- "0..*" Avaliacao : recebe
```

## Entidades e Responsabilidades

| Classe / Entidade | Papel no Sistema | Principais Regras de Negócio |
| :--- | :--- | :--- |
| **`Usuario`** | Comprador, vendedor e administrador | Cadastro com e-mail único, edição de perfil, controle de permissões (`USUARIO`, `ADMIN`) e perfil público de vendedor. |
| **`Permissao`** | Papéis atribuídos ao usuário | Controla autorização administrativa nas rotas de categorias, usuários, listagem global de anúncios e pedidos. |
| **`Categoria`** | Classificação de colecionáveis | Permite filtragem no catálogo e gestão administrativa (cadastro, edição, ativação/desativação e remoção quando sem anúncios). |
| **`Anuncio`** | Produto ofertado por um vendedor | Controla estoque, condição (`NOVO`/`USADO`), conservação, imagens, disponibilidade e estorno/baixa de estoque nos pedidos. |
| **`ItemCarrinho`** | Carrinho de compras do comprador | Calcula subtotais por item, valida estoque disponível e mantém itens de um único vendedor por pedido. |
| **`Pedido`** | Compra formalizada com histórico | Snapshot dos itens (`ItemPedido`) e linha do tempo (`EventoPedido`) seguindo `CRIADO -> CONFIRMADO -> ENVIADO -> CONCLUIDO` ou `CANCELADO` com estorno de estoque. |
| **`Avaliacao`** | Reputação do vendedor após conclusão | Nota de 1 a 5 e comentário vinculados a um pedido concluído e único por pedido/autor. |

## Arquitetura no Frontend Angular

No aplicativo Angular (`geekhub/`), todos os componentes utilizam `standalone: false` organizados em **NgModules** com carregamento preguiçoso (*lazy loading*) por funcionalidade:

- `CatalogoModule`, `VendedoresModule`, `AutenticacaoModule`, `ContaModule`
- `AnunciosModule`, `CategoriasModule`, `CarrinhoModule`, `PedidosModule`, `DashboardModule`, `CabecalhoModule`
- A camada `DadosGeekhub` (`geekhub/src/app/api/dados-geekhub.ts`) centraliza as chamadas aos clientes HTTP (`AnuncioApi`, `CategoriaApi`, `CarrinhoApi`, `PedidoApi`, `UsuarioApi`, `AvaliacaoApi`, `AutenticacaoApi`) no modo `'auto'`, alternando automaticamente para a persistência local em `localStorage` (`App`) caso a API esteja indisponível.
