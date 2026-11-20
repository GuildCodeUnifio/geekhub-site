import { Injector, type ProviderToken } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import type {
  AdicionarAoCarrinhoRequest,
  AlterarQuantidadeRequest,
  AnuncioResponse,
  App,
  CadastrarUsuarioRequest,
  CarrinhoResponse,
  CategoriaResponse,
  ConsultarAnunciosRequest,
  ConsultarAnunciosResponse,
  PerfilVendedor,
  RemoverDoCarrinhoRequest,
  ResultadoOperacaoCarrinho,
} from '../app';
import type { EntrarRequest } from '../autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from '../cabecalho/cabecalho/cabecalho';
import { AnuncioApi } from './clientes/anuncio-api';
import { AutenticacaoApi } from './clientes/autenticacao-api';
import { CarrinhoApi } from './clientes/carrinho-api';
import { CategoriaApi } from './clientes/categoria-api';
import { UsuarioApi } from './clientes/usuario-api';
import { FONTE_DADOS, type FonteDados } from './configuracao-api';
import {
  paraAnuncio,
  paraAnuncioDoCatalogo,
  paraCarrinho,
  paraCategoria,
  paraPerfilVendedor,
  paraUsuario,
} from './mapeadores-api';
import { SessaoApi } from './sessao-api';
import { extrairMensagemErro, statusErro } from './utilitarios-api';

/**
 * Ponto único de acesso aos dados das telas.
 * Com a fonte `api`, consome o geekhub-api; com `mock`, usa os dados de exemplo do `App`.
 * Erros inesperados da API são emitidos como `Error` com a mensagem pronta para exibição.
 */
export class DadosGeekhub {
  readonly fonte: FonteDados;

  constructor(
    private readonly app: App,
    private readonly injetor: Injector,
  ) {
    this.fonte = injetor.get(FONTE_DADOS);

    if (this.usaApi) {
      const sessao = this.obter(SessaoApi);

      if (!sessao.autenticado && app.usuarioAtual) {
        app.definirUsuarioAtual(null);
      }

      sessao.sessaoExpirada.subscribe(() => app.definirUsuarioAtual(null));
    }
  }

  get usaApi(): boolean {
    return this.fonte === 'api';
  }

  entrar(request: EntrarRequest): Observable<UsuarioResponse | null> {
    if (!this.usaApi) {
      return of(this.app.entrar(request));
    }

    const sessao = this.obter(SessaoApi);

    return this.obter(AutenticacaoApi)
      .entrar({ email: request.email.trim().toLowerCase(), senha: request.senha })
      .pipe(
        tap(resposta => sessao.iniciar(resposta)),
        switchMap(() => this.identificarUsuarioAutenticado()),
        tap(usuario => this.app.definirUsuarioAtual(usuario)),
        catchError((erro: unknown) => {
          sessao.limpar();
          this.app.definirUsuarioAtual(null);

          return statusErro(erro) === 401
            ? of(null)
            : this.falhar(erro, 'Não foi possível entrar. Tente novamente.');
        }),
      );
  }

  cadastrar(request: CadastrarUsuarioRequest): Observable<UsuarioResponse | null> {
    if (!this.usaApi) {
      return of(this.app.cadastrar(request));
    }

    return this.obter(UsuarioApi)
      .cadastrar({
        nome: request.nome.trim(),
        email: request.email.trim().toLowerCase(),
        senha: request.senha,
      })
      .pipe(
        map(paraUsuario),
        catchError((erro: unknown) =>
          statusErro(erro) === 409
            ? of(null)
            : this.falhar(erro, 'Não foi possível criar a conta. Tente novamente.'),
        ),
      );
  }

  listarCategorias(): Observable<CategoriaResponse[]> {
    if (!this.usaApi) {
      return of(this.app.listarCategorias());
    }

    return this.obter(CategoriaApi)
      .listar({ ativa: true }, { tamanho: 100, ordenacao: 'nome' })
      .pipe(
        map(pagina => pagina.itens.map(paraCategoria)),
        catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar as categorias.')),
      );
  }

  consultarAnuncios(request: ConsultarAnunciosRequest = {}): Observable<ConsultarAnunciosResponse> {
    if (!this.usaApi) {
      return of(this.app.consultarAnuncios(request));
    }

    const itensPorPagina =
      request.itensPorPagina && Number.isInteger(request.itensPorPagina) && request.itensPorPagina > 0
        ? request.itensPorPagina
        : 8;
    const pagina =
      request.pagina && Number.isInteger(request.pagina) && request.pagina >= 1 ? request.pagina : 1;

    return this.obter(AnuncioApi)
      .pesquisar(
        { nome: request.termo?.trim() || undefined, categoriaId: request.categoriaIdentificador },
        { pagina: pagina - 1, tamanho: itensPorPagina },
      )
      .pipe(
        map(resposta => ({
          anuncios: resposta.itens.map(paraAnuncioDoCatalogo),
          pagina: resposta.numero + 1,
          itensPorPagina: resposta.tamanho,
          total: resposta.totalElementos,
        })),
        catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar os anúncios.')),
      );
  }

  buscarAnuncio(identificador: number): Observable<AnuncioResponse | null> {
    if (!this.usaApi) {
      return of(this.app.buscarAnuncio(identificador));
    }

    return this.obter(AnuncioApi)
      .detalhar(identificador)
      .pipe(
        map(paraAnuncio),
        catchError((erro: unknown) =>
          statusErro(erro) === 404 ? of(null) : this.falhar(erro, 'Não foi possível carregar o anúncio.'),
        ),
      );
  }

  buscarVendedor(identificador: number): Observable<PerfilVendedor | null> {
    if (!this.usaApi) {
      return of(this.app.buscarVendedor(identificador));
    }

    return this.obter(UsuarioApi)
      .perfilVendedor(identificador)
      .pipe(
        map(paraPerfilVendedor),
        catchError((erro: unknown) =>
          statusErro(erro) === 404 ? of(null) : this.falhar(erro, 'Não foi possível carregar o vendedor.'),
        ),
      );
  }

  /** Na API o carrinho é sempre o do usuário autenticado; o identificador vale apenas para o mock. */
  consultarCarrinho(compradorIdentificador: number): Observable<CarrinhoResponse> {
    if (!this.usaApi) {
      return of(this.app.consultarCarrinho(compradorIdentificador));
    }

    return this.obter(CarrinhoApi)
      .consultar()
      .pipe(
        map(paraCarrinho),
        catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar o carrinho.')),
      );
  }

  adicionarAoCarrinho(request: AdicionarAoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    if (!this.usaApi) {
      return of(this.app.adicionarAoCarrinho(request));
    }

    return this.operarCarrinho(
      this.obter(CarrinhoApi).adicionarItem({
        anuncioId: request.anuncioIdentificador,
        quantidade: request.quantidade,
      }),
      'Produto adicionado ao carrinho.',
    );
  }

  alterarQuantidadeCarrinho(request: AlterarQuantidadeRequest): Observable<ResultadoOperacaoCarrinho> {
    if (!this.usaApi) {
      return of(this.app.alterarQuantidadeCarrinho(request));
    }

    return this.operarItemDoCarrinho(request.anuncioIdentificador, identificador =>
      this.obter(CarrinhoApi).editarItem(identificador, { quantidade: request.quantidade }),
    );
  }

  removerDoCarrinho(request: RemoverDoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    if (!this.usaApi) {
      return of(this.app.removerDoCarrinho(request));
    }

    return this.operarItemDoCarrinho(request.anuncioIdentificador, identificador =>
      this.obter(CarrinhoApi).removerItem(identificador),
    );
  }

  encerrarSessao(): void {
    if (this.usaApi) {
      this.obter(SessaoApi).limpar();
    }
  }

  /**
   * O JWT da API não traz o id do usuário (apenas nome e e-mail), então ele é obtido
   * pelo carrinho do usuário autenticado (`compradorId`) quando a claim `id` não existir.
   */
  private identificarUsuarioAutenticado(): Observable<UsuarioResponse> {
    const claims = this.obter(SessaoApi).claims();
    const identificador$ =
      typeof claims?.id === 'number'
        ? of(claims.id)
        : this.obter(CarrinhoApi)
            .consultar()
            .pipe(map(carrinho => carrinho.compradorId));

    return identificador$.pipe(
      switchMap(identificador => this.obter(UsuarioApi).detalhar(identificador)),
      map(paraUsuario),
    );
  }

  /** Executa a operação e devolve o carrinho atualizado, inclusive em caso de erro. */
  private operarCarrinho(
    operacao: Observable<unknown>,
    mensagemSucesso = '',
  ): Observable<ResultadoOperacaoCarrinho> {
    const carrinhoApi = this.obter(CarrinhoApi);
    const carrinhoAtual = () =>
      carrinhoApi.consultar().pipe(
        map(paraCarrinho),
        catchError(() => of<CarrinhoResponse>({ compradorIdentificador: 0, itens: [], total: 0 })),
      );

    return operacao.pipe(
      switchMap(() => carrinhoAtual()),
      map(carrinho => ({ sucesso: true, mensagem: mensagemSucesso, carrinho })),
      catchError((erro: unknown) =>
        carrinhoAtual().pipe(
          map(carrinho => ({
            sucesso: false,
            mensagem: extrairMensagemErro(erro, 'Não foi possível atualizar o carrinho.'),
            carrinho,
          })),
        ),
      ),
    );
  }

  /** As rotas de item usam o id do item no carrinho, então ele é localizado pelo anúncio. */
  private operarItemDoCarrinho(
    anuncioIdentificador: number,
    operacao: (itemIdentificador: number) => Observable<unknown>,
  ): Observable<ResultadoOperacaoCarrinho> {
    const localizarItem = this.obter(CarrinhoApi)
      .consultar()
      .pipe(
        switchMap(carrinho => {
          const item = carrinho.itens.find(atual => atual.anuncioId === anuncioIdentificador);
          return item
            ? operacao(item.id)
            : throwError(() => new Error('Item não encontrado no carrinho.'));
        }),
      );

    return this.operarCarrinho(localizarItem);
  }

  private obter<T>(token: ProviderToken<T>): T {
    return this.injetor.get(token);
  }

  private falhar(erro: unknown, padrao: string): Observable<never> {
    return throwError(() => new Error(extrairMensagemErro(erro, padrao)));
  }
}
