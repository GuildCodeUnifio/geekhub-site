import { Injector, type ProviderToken } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import type { App, CadastrarUsuarioRequest } from '../app';
import type { EntrarRequest } from '../autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from '../cabecalho/cabecalho/cabecalho';
import { AutenticacaoApi } from './clientes/autenticacao-api';
import { CarrinhoApi } from './clientes/carrinho-api';
import { UsuarioApi } from './clientes/usuario-api';
import { FONTE_DADOS, type FonteDados } from './configuracao-api';
import { paraUsuario } from './mapeadores-api';
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

  private obter<T>(token: ProviderToken<T>): T {
    return this.injetor.get(token);
  }

  private falhar(erro: unknown, padrao: string): Observable<never> {
    return throwError(() => new Error(extrairMensagemErro(erro, padrao)));
  }
}
