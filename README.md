# GeekHub

Marketplace de produtos geek e colecionáveis, desenvolvido pela equipe
GuildCode como projeto acadêmico da UNIFIO.

A proposta é aproximar compradores e vendedores em uma plataforma especializada,
com anúncios detalhados e avaliações que ajudem na decisão de compra.

## Escopo atual

O projeto está em desenvolvimento. O foco inicial são as seguintes telas:

- Catálogo de produtos.
- Login e cadastro de usuários.
- Detalhes do produto e perfil público do vendedor.
- Edição de perfil.
- Carrinho e revisão do pedido.
- Minhas compras e detalhes do pedido.

O MVP não inclui pagamento integrado, cálculo automático de frete ou chat.

## Tecnologias

A interface utiliza Angular e TypeScript. O código da aplicação está em
[`geekhub/`](geekhub/).

## Executar localmente

Com Node.js e npm instalados, execute a partir da raiz do repositório:

```bash
cd geekhub
npm ci
npm start
```

A aplicação estará disponível em <http://localhost:4200/>.
O repositório também inclui uma configuração de Dev Container em `.devcontainer/`.

### Integração com a API

Por padrão o frontend consome o [geekhub-api](https://github.com/GuildCodeUnifio/geekhub-api)
em `http://localhost:8080`. Suba a API antes de iniciar o frontend e entre com um dos usuários
iniciais dela (por exemplo `usuario@geekhub.com`, senha `123456`).

Para usar os dados de exemplo sem a API, altere `fonteDados` para `'mock'` em
[`geekhub/src/app/api/configuracao-api.ts`](geekhub/src/app/api/configuracao-api.ts),
onde também fica a URL da API.

## Contribuir

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para seguir o fluxo de branches da equipe.

## Licença

Este projeto é distribuído sob a GNU General Public License, versão 3
(`GPL-3.0-only`). O texto completo está em [LICENSE](LICENSE).
