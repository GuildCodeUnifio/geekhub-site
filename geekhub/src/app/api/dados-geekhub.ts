import { Injector, signal, type ProviderToken, type WritableSignal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import type {
  AdicionarAoCarrinhoRequest,
  AlterarQuantidadeRequest,
  AnuncioResponse,
  App,
  AvaliarPedidoRequest,
  CadastrarUsuarioRequest,
  CarrinhoResponse,
  CategoriaResponse,
  ConsultarAnunciosRequest,
  ConsultarAnunciosResponse,
  EditarPerfilRequest,
  ListarComprasRequest,
  ListarComprasResponse,
  ListarMeusAnunciosResponse,
  PedidoResponse,
  PerfilVendedor,
  RemoverDoCarrinhoRequest,
  ResultadoEdicaoPerfil,
  ResultadoOperacaoAnuncio,
  ResultadoOperacaoCarrinho,
  ResultadoOperacaoPedido,
  SalvarAnuncioRequest,
} from '../app';
import type { EntrarRequest } from '../autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from '../cabecalho/cabecalho/cabecalho';
import { AnuncioApi } from './clientes/anuncio-api';
import { AutenticacaoApi } from './clientes/autenticacao-api';
import { AvaliacaoApi } from './clientes/avaliacao-api';
import { CarrinhoApi } from './clientes/carrinho-api';
import { CategoriaApi } from './clientes/categoria-api';
import { PedidoApi } from './clientes/pedido-api';
import { UsuarioApi } from './clientes/usuario-api';
import { FONTE_DADOS, type FonteDados } from './configuracao-api';
import {
  paraAnuncio,
  paraAnuncioAdmin,
  paraAnuncioDoCatalogo,
  paraAnuncioSalvo,
  paraCarrinho,
  paraCategoria,
  paraCompra,
  paraCondicaoApi,
  paraConservacaoApi,
  paraMeuAnuncio,
  paraPedido,
  paraPerfilVendedor,
  paraUsuario,
} from './mapeadores-api';
import { SessaoApi } from './sessao-api';
import { ehErroConexaoApi, extrairMensagemErro, statusErro } from './utilitarios-api';

const CHAVE_ORIGEM_SESSAO_STORAGE = 'geekhub.origemSessao';
type OrigemSessao = 'api' | 'mock';

/**
 * Ponto único de acesso aos dados das telas.
 * Em `auto`, tenta consumir o geekhub-api e alterna automaticamente para os dados do `App`
 * quando a API estiver inacessível (`status === 0`); em `api` exige a API; em `mock` usa apenas o `App`.
 */
export class DadosGeekhub {
  readonly fonte: FonteDados;
  private readonly modoAtivoSinal: WritableSignal<OrigemSessao>;

  constructor(
    private readonly app: App,
    private readonly injetor: Injector,
  ) {
    this.fonte = injetor.get(FONTE_DADOS);
    this.modoAtivoSinal = signal<OrigemSessao>(this.fonte === 'mock' ? 'mock' : 'api');

    if (this.fonte !== 'mock') {
      const sessao = this.obter(SessaoApi);
      const origem = this.carregarOrigemSessao();

      if (!sessao.autenticado && app.usuarioAtual) {
        if (this.fonte === 'api' || origem !== 'mock') {
          this.limparOrigemSessao();
          app.definirUsuarioAtual(null);
        }
      }

      sessao.sessaoExpirada.subscribe(() => {
        this.limparOrigemSessao();
        app.definirUsuarioAtual(null);
      });
    }
  }

  get modoAtual(): OrigemSessao {
    return this.modoAtivoSinal();
  }

  get usaApi(): boolean {
    return this.modoAtivoSinal() === 'api';
  }

  get usandoFallbackMock(): boolean {
    return this.fonte === 'auto' && this.modoAtivoSinal() === 'mock';
  }

  usuarioEhAdmin(): boolean {
    const usuario = this.app.usuarioAtual;
    if (!usuario) {
      return false;
    }

    if (this.usaApi && this.obter(SessaoApi).autenticado) {
      return this.obter(SessaoApi).ehAdmin;
    }

    return this.app.usuarioMockEhAdmin(usuario.identificador);
  }

  entrar(request: EntrarRequest): Observable<UsuarioResponse | null> {
    if (!this.usaApi) {
      return of(this.entrarNoMock(request));
    }

    const sessao = this.obter(SessaoApi);

    return this.obter(AutenticacaoApi)
      .entrar({ email: request.email.trim().toLowerCase(), senha: request.senha })
      .pipe(
        tap(resposta => sessao.iniciar(resposta)),
        switchMap(() => this.identificarUsuarioAutenticado()),
        tap(usuario => {
          this.salvarOrigemSessao('api');
          this.app.definirUsuarioAtual(usuario);
        }),
        catchError((erro: unknown) => {
          sessao.limpar();
          this.limparOrigemSessao();

          if (this.deveUsarFallback(erro)) {
            return this.ativarFallback(() => this.entrarNoMock(request));
          }

          this.app.definirUsuarioAtual(null);

          return statusErro(erro) === 401
            ? of(null)
            : this.falhar(erro, 'Não foi possível entrar. Tente novamente.');
        }),
      );
  }

  cadastrar(request: CadastrarUsuarioRequest): Observable<UsuarioResponse | null> {
    return this.executarComFallback(
      this.obter(UsuarioApi)
        .cadastrar({
          nome: request.nome.trim(),
          email: request.email.trim().toLowerCase(),
          senha: request.senha,
        })
        .pipe(map(paraUsuario)),
      () => this.app.cadastrar(request),
    ).pipe(
      catchError((erro: unknown) =>
        statusErro(erro) === 409
          ? of(null)
          : this.falhar(erro, 'Não foi possível criar a conta. Tente novamente.'),
      ),
    );
  }

  listarCategorias(): Observable<CategoriaResponse[]> {
    return this.executarComFallback(
      this.obter(CategoriaApi)
        .listar({ ativa: true }, { tamanho: 100, ordenacao: 'nome' })
        .pipe(map(pagina => pagina.itens.map(paraCategoria))),
      () => this.app.listarCategorias(),
    ).pipe(
      catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar as categorias.')),
    );
  }

  consultarAnuncios(request: ConsultarAnunciosRequest = {}): Observable<ConsultarAnunciosResponse> {
    const itensPorPagina =
      request.itensPorPagina && Number.isInteger(request.itensPorPagina) && request.itensPorPagina > 0
        ? request.itensPorPagina
        : 8;
    const pagina =
      request.pagina && Number.isInteger(request.pagina) && request.pagina >= 1 ? request.pagina : 1;

    return this.executarComFallback(
      this.obter(AnuncioApi)
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
        ),
      () => this.app.consultarAnuncios(request),
    ).pipe(
      catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar os anúncios.')),
    );
  }

  buscarAnuncio(identificador: number): Observable<AnuncioResponse | null> {
    return this.executarComFallback(
      this.obter(AnuncioApi).detalhar(identificador).pipe(map(paraAnuncio)),
      () => this.app.buscarAnuncio(identificador),
    ).pipe(
      catchError((erro: unknown) =>
        statusErro(erro) === 404 ? of(null) : this.falhar(erro, 'Não foi possível carregar o anúncio.'),
      ),
    );
  }

  listarMeusAnuncios(
    usuarioIdentificador: number,
    pagina = 1,
    itensPorPagina = 8,
    incluirTodosAdmin = false,
  ): Observable<ListarMeusAnunciosResponse> {
    const tamanho =
      Number.isInteger(itensPorPagina) && itensPorPagina > 0 ? itensPorPagina : 8;
    const numeroPagina = Number.isInteger(pagina) && pagina >= 1 ? pagina : 1;
    const paginacao = { pagina: numeroPagina - 1, tamanho };
    const ehAdmin = incluirTodosAdmin && this.usuarioEhAdmin();
    const anuncioApi = this.obter(AnuncioApi);

    const chamada$ = ehAdmin
      ? anuncioApi.listarAdmin(paginacao).pipe(
          map(resposta => ({
            anuncios: resposta.itens.map(paraAnuncioAdmin),
            pagina: resposta.numero + 1,
            itensPorPagina: resposta.tamanho,
            total: resposta.totalElementos,
          })),
        )
      : anuncioApi.listarMeus(paginacao).pipe(
          map(resposta => ({
            anuncios: resposta.itens.map(paraMeuAnuncio),
            pagina: resposta.numero + 1,
            itensPorPagina: resposta.tamanho,
            total: resposta.totalElementos,
          })),
        );

    return this.executarComFallback(chamada$, () =>
      this.app.listarMeusAnuncios(usuarioIdentificador, numeroPagina, tamanho, incluirTodosAdmin),
    ).pipe(
      catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar os anúncios.')),
    );
  }

  cadastrarAnuncio(
    vendedorIdentificador: number,
    request: SalvarAnuncioRequest,
  ): Observable<ResultadoOperacaoAnuncio> {
    const imagens = request.imagens.map(url => url.trim()).filter(Boolean);

    return this.executarComFallback(
      this.obter(AnuncioApi)
        .cadastrar({
          nome: request.nome.trim(),
          descricao: request.descricao.trim(),
          categoriaId: request.categoriaIdentificador,
          preco: request.preco,
          quantidadeDisponivel: request.estoque,
          condicao: paraCondicaoApi(request.estado),
          conservacao: paraConservacaoApi(request.conservacao),
          imagens,
        })
        .pipe(
          map(anuncio => ({
            sucesso: true,
            mensagem: 'Anúncio cadastrado com sucesso.',
            anuncio: paraAnuncioSalvo(anuncio, this.vendedorAtualResumo(vendedorIdentificador)),
          })),
        ),
      () => this.app.cadastrarAnuncio(vendedorIdentificador, request),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível cadastrar o anúncio.'),
          anuncio: null,
        }),
      ),
    );
  }

  editarAnuncio(
    anuncioIdentificador: number,
    usuarioIdentificador: number,
    request: SalvarAnuncioRequest,
  ): Observable<ResultadoOperacaoAnuncio> {
    const imagens = request.imagens.map(url => url.trim()).filter(Boolean);

    return this.executarComFallback(
      this.obter(AnuncioApi)
        .editar(anuncioIdentificador, {
          nome: request.nome.trim(),
          descricao: request.descricao.trim(),
          categoriaId: request.categoriaIdentificador,
          preco: request.preco,
          quantidadeDisponivel: request.estoque,
          disponivel: request.disponivel ?? request.estoque > 0,
          condicao: paraCondicaoApi(request.estado),
          conservacao: paraConservacaoApi(request.conservacao),
          imagens,
        })
        .pipe(
          map(anuncio => ({
            sucesso: true,
            mensagem: 'Anúncio atualizado com sucesso.',
            anuncio: paraAnuncioSalvo(anuncio, this.vendedorAtualResumo(usuarioIdentificador)),
          })),
        ),
      () => this.app.editarAnuncio(anuncioIdentificador, usuarioIdentificador, request),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível atualizar o anúncio.'),
          anuncio: null,
        }),
      ),
    );
  }

  removerAnuncio(
    anuncioIdentificador: number,
    usuarioIdentificador: number,
  ): Observable<ResultadoOperacaoAnuncio> {
    return this.executarComFallback(
      this.obter(AnuncioApi)
        .remover(anuncioIdentificador)
        .pipe(
          map(() => ({
            sucesso: true,
            mensagem: 'Anúncio removido com sucesso.',
            anuncio: null,
          })),
        ),
      () => this.app.removerAnuncio(anuncioIdentificador, usuarioIdentificador),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível remover o anúncio.'),
          anuncio: null,
        }),
      ),
    );
  }

  private vendedorAtualResumo(identificadorPadrao: number) {
    const atual = this.app.usuarioAtual;
    return {
      identificador: atual?.identificador ?? identificadorPadrao,
      nome: atual?.nome ?? 'Vendedor',
      ...(atual?.foto ? { foto: atual.foto } : {}),
      media: null,
      contagem: 0,
    };
  }

  buscarVendedor(identificador: number): Observable<PerfilVendedor | null> {
    return this.executarComFallback(
      this.obter(UsuarioApi).perfilVendedor(identificador).pipe(map(paraPerfilVendedor)),
      () => this.app.buscarVendedor(identificador),
    ).pipe(
      catchError((erro: unknown) =>
        statusErro(erro) === 404 ? of(null) : this.falhar(erro, 'Não foi possível carregar o vendedor.'),
      ),
    );
  }

  /** Na API o carrinho é sempre o do usuário autenticado; o identificador vale apenas para o mock. */
  consultarCarrinho(compradorIdentificador: number): Observable<CarrinhoResponse> {
    return this.executarComFallback(
      this.obter(CarrinhoApi).consultar().pipe(map(paraCarrinho)),
      () => this.app.consultarCarrinho(compradorIdentificador),
    ).pipe(
      catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar o carrinho.')),
    );
  }

  adicionarAoCarrinho(request: AdicionarAoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.operarCarrinho(
      this.obter(CarrinhoApi).adicionarItem({
        anuncioId: request.anuncioIdentificador,
        quantidade: request.quantidade,
      }),
      'Produto adicionado ao carrinho.',
      () => this.app.adicionarAoCarrinho(request),
    );
  }

  alterarQuantidadeCarrinho(request: AlterarQuantidadeRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.operarItemDoCarrinho(
      request.anuncioIdentificador,
      identificador => this.obter(CarrinhoApi).editarItem(identificador, { quantidade: request.quantidade }),
      () => this.app.alterarQuantidadeCarrinho(request),
    );
  }

  removerDoCarrinho(request: RemoverDoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.operarItemDoCarrinho(
      request.anuncioIdentificador,
      identificador => this.obter(CarrinhoApi).removerItem(identificador),
      () => this.app.removerDoCarrinho(request),
    );
  }

  limparCarrinho(compradorIdentificador: number): Observable<ResultadoOperacaoCarrinho> {
    return this.operarCarrinho(
      this.obter(CarrinhoApi).limpar(),
      'Carrinho esvaziado.',
      () => this.app.limparCarrinho(compradorIdentificador),
    );
  }

  editarPerfil(request: EditarPerfilRequest): Observable<ResultadoEdicaoPerfil> {
    const emailAnterior = this.app.usuarioAtual?.email;

    return this.executarComFallback(
      this.obter(UsuarioApi)
        .editar(request.usuarioIdentificador, {
          nome: request.nome.trim(),
          email: request.email.trim().toLowerCase(),
          imagemPerfil: request.foto?.trim() || null,
        })
        .pipe(
          map(paraUsuario),
          map((usuario): ResultadoEdicaoPerfil => {
            // O token da API identifica o usuário pelo e-mail; ao trocá-lo, é preciso entrar novamente.
            if (emailAnterior && emailAnterior !== usuario.email) {
              this.obter(SessaoApi).limpar();
              this.limparOrigemSessao();
              this.app.definirUsuarioAtual(null);
              return {
                sucesso: true,
                mensagem: 'Perfil atualizado. Entre novamente com o novo e-mail.',
                usuario,
                exigeNovoLogin: true,
              };
            }

            this.app.definirUsuarioAtual(usuario);
            return { sucesso: true, mensagem: 'Perfil atualizado com sucesso.', usuario };
          }),
        ),
      () => this.app.editarPerfil(request),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível atualizar o perfil.'),
          usuario: null,
        }),
      ),
    );
  }

  criarPedido(compradorIdentificador: number): Observable<ResultadoOperacaoPedido> {
    return this.executarComFallback(
      this.obter(PedidoApi)
        .criar()
        .pipe(
          map(pedido => ({
            sucesso: true,
            mensagem: 'Pedido criado com sucesso.',
            pedido: paraPedido(pedido),
          })),
        ),
      () => this.app.criarPedido(compradorIdentificador),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível criar o pedido.'),
          pedido: null,
        }),
      ),
    );
  }

  listarCompras(request: ListarComprasRequest): Observable<ListarComprasResponse> {
    const itensPorPagina =
      request.itensPorPagina && Number.isInteger(request.itensPorPagina) && request.itensPorPagina > 0
        ? request.itensPorPagina
        : 10;
    const pagina =
      request.pagina && Number.isInteger(request.pagina) && request.pagina >= 1 ? request.pagina : 1;

    return this.executarComFallback(
      this.obter(PedidoApi)
        .listarCompras({ estado: request.estado }, { pagina: pagina - 1, tamanho: itensPorPagina })
        .pipe(
          map(resposta => ({
            compras: resposta.itens.map(paraCompra),
            pagina: resposta.numero + 1,
            itensPorPagina: resposta.tamanho,
            total: resposta.totalElementos,
          })),
        ),
      () => this.app.listarCompras(request),
    ).pipe(
      catchError((erro: unknown) => this.falhar(erro, 'Não foi possível carregar suas compras.')),
    );
  }

  detalharPedido(
    compradorIdentificador: number,
    pedidoIdentificador: number,
  ): Observable<PedidoResponse | null> {
    return this.executarComFallback(
      this.obter(PedidoApi).detalhar(pedidoIdentificador).pipe(map(paraPedido)),
      () => this.app.detalharPedido(compradorIdentificador, pedidoIdentificador),
    ).pipe(
      catchError((erro: unknown) =>
        statusErro(erro) === 404 || statusErro(erro) === 403
          ? of(null)
          : this.falhar(erro, 'Não foi possível carregar o pedido.'),
      ),
    );
  }

  avaliarPedido(request: AvaliarPedidoRequest): Observable<ResultadoOperacaoPedido> {
    return this.executarComFallback(
      this.obter(AvaliacaoApi)
        .cadastrar({
          pedidoId: request.pedidoIdentificador,
          nota: request.nota,
          comentario: request.comentario?.trim() || null,
        })
        .pipe(
          switchMap(() => this.obter(PedidoApi).detalhar(request.pedidoIdentificador)),
          map(pedido => ({
            sucesso: true,
            mensagem: 'Avaliação enviada. Obrigado!',
            pedido: paraPedido(pedido),
          })),
        ),
      () => this.app.avaliarPedido(request),
    ).pipe(
      catchError((erro: unknown) =>
        of({
          sucesso: false,
          mensagem: extrairMensagemErro(erro, 'Não foi possível enviar a avaliação.'),
          pedido: null,
        }),
      ),
    );
  }

  encerrarSessao(): void {
    this.limparOrigemSessao();

    if (this.fonte !== 'mock') {
      this.obter(SessaoApi).limpar();
    }
  }

  private entrarNoMock(request: EntrarRequest): UsuarioResponse | null {
    const usuario = this.app.entrar(request);

    if (usuario) {
      this.salvarOrigemSessao('mock');
    } else {
      this.limparOrigemSessao();
    }

    return usuario;
  }

  private executarComFallback<T>(api$: Observable<T>, mockFn: () => T): Observable<T> {
    if (!this.usaApi) {
      return of(mockFn());
    }

    return api$.pipe(
      tap(() => this.confirmarApiAtiva()),
      catchError((erro: unknown) =>
        this.deveUsarFallback(erro) ? this.ativarFallback(mockFn) : throwError(() => erro),
      ),
    );
  }

  private deveUsarFallback(erro: unknown): boolean {
    return this.fonte === 'auto' && ehErroConexaoApi(erro);
  }

  private ativarFallback<T>(mockFn: () => T): Observable<T> {
    this.modoAtivoSinal.set('mock');
    return of(mockFn());
  }

  private confirmarApiAtiva(): void {
    if (
      this.fonte === 'auto' &&
      !this.obter(SessaoApi).autenticado &&
      this.carregarOrigemSessao() === 'mock'
    ) {
      this.limparOrigemSessao();
      this.app.definirUsuarioAtual(null);
    }
  }

  private carregarOrigemSessao(): OrigemSessao | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const valor = localStorage.getItem(CHAVE_ORIGEM_SESSAO_STORAGE);
      return valor === 'api' || valor === 'mock' ? valor : null;
    } catch {
      return null;
    }
  }

  private salvarOrigemSessao(origem: OrigemSessao): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(CHAVE_ORIGEM_SESSAO_STORAGE, origem);
    } catch {
      // Ignora indisponibilidade de storage no ambiente atual.
    }
  }

  private limparOrigemSessao(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(CHAVE_ORIGEM_SESSAO_STORAGE);
    } catch {
      // Ignora indisponibilidade de storage no ambiente atual.
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
    mensagemSucesso: string,
    mockFn: () => ResultadoOperacaoCarrinho,
  ): Observable<ResultadoOperacaoCarrinho> {
    const carrinhoApi = this.obter(CarrinhoApi);
    const carrinhoAtual = () =>
      carrinhoApi.consultar().pipe(
        map(paraCarrinho),
        catchError(() => of<CarrinhoResponse>({ compradorIdentificador: 0, itens: [], total: 0 })),
      );

    return this.executarComFallback(
      operacao.pipe(
        switchMap(() => carrinhoAtual()),
        map(carrinho => ({ sucesso: true, mensagem: mensagemSucesso, carrinho })),
      ),
      mockFn,
    ).pipe(
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
    mockFn: () => ResultadoOperacaoCarrinho,
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

    return this.operarCarrinho(localizarItem, '', mockFn);
  }

  private obter<T>(token: ProviderToken<T>): T {
    return this.injetor.get(token);
  }

  private falhar(erro: unknown, padrao: string): Observable<never> {
    return throwError(() => new Error(extrairMensagemErro(erro, padrao)));
  }
}
