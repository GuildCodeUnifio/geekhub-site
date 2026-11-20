import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

import {
  App,
  type AdicionarAoCarrinhoRequest,
  type AlterarQuantidadeRequest,
  type CarrinhoResponse,
  type ItemCarrinhoResponse,
  type RemoverDoCarrinhoRequest,
  type ResultadoOperacaoCarrinho,
} from '../../app';

export type {
  AdicionarAoCarrinhoRequest,
  AlterarQuantidadeRequest,
  CarrinhoResponse,
  ItemCarrinhoResponse,
  RemoverDoCarrinhoRequest,
  ResultadoOperacaoCarrinho,
};

@Component({
  selector: 'app-carrinho',
  standalone: false,
  styleUrl: './carrinho.componente.scss',
  templateUrl: './carrinho.componente.html',
})
export class CarrinhoComponente implements OnInit {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);

  private readonly compradorSelecionado = signal<number | undefined>(undefined);
  private readonly mensagemSinal = signal('');
  private readonly carrinhoDaApi = signal<CarrinhoResponse | null>(null);
  readonly carregando = signal(false);

  readonly colunasExibidas: string[] = ['produto', 'preco', 'quantidade', 'subtotal', 'acao'];

  /** No modo mock reflete o App em tempo real; no modo API, o último carrinho recebido. */
  readonly carrinho = computed<CarrinhoResponse>(() => {
    if (this.app.dados.usaApi) {
      return (
        this.carrinhoDaApi() ?? {
          compradorIdentificador: this.compradorIdentificador,
          itens: [],
          total: 0,
        }
      );
    }

    this.app.versaoEstadoCarrinhos;
    return this.app.consultarCarrinho(this.compradorIdentificador);
  });

  ngOnInit(): void {
    if (this.app.dados.usaApi) {
      this.recarregar();
    }
  }

  recarregar(): void {
    this.carregando.set(true);
    this.consultarCarrinho().subscribe({
      next: (carrinho) => {
        this.carrinhoDaApi.set(carrinho);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.mensagemSinal.set(erro.message);
        this.carregando.set(false);
      },
    });
  }

  get mensagem(): string {
    return this.mensagemSinal();
  }

  set mensagem(valor: string) {
    this.mensagemSinal.set(valor);
  }

  get compradorIdentificador(): number {
    return this.compradorSelecionado() ?? this.app.usuarioAtual?.identificador ?? 1;
  }

  set compradorIdentificador(identificador: number) {
    this.compradorSelecionado.set(identificador);
    this.mensagemSinal.set('');

    if (this.app.dados.usaApi) {
      this.recarregar();
    }
  }

  get itensCarrinho(): ItemCarrinhoResponse[] {
    return this.carrinho().itens;
  }

  get valorTotal(): number {
    return this.carrinho().total;
  }

  get podeAvancar(): boolean {
    return (
      this.itensCarrinho.length > 0 &&
      this.itensCarrinho.every((item) => !this.itemComPendencia(item))
    );
  }

  consultarCarrinho(compradorIdentificador = this.compradorIdentificador): Observable<CarrinhoResponse> {
    return this.app.dados.consultarCarrinho(compradorIdentificador);
  }

  adicionarAoCarrinho(request: AdicionarAoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.executar(this.app.dados.adicionarAoCarrinho(request));
  }

  alterarQuantidade(request: AlterarQuantidadeRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.executar(this.app.dados.alterarQuantidadeCarrinho(request));
  }

  removerDoCarrinho(request: RemoverDoCarrinhoRequest): Observable<ResultadoOperacaoCarrinho> {
    return this.executar(this.app.dados.removerDoCarrinho(request));
  }

  aoSelecionarQuantidade(
    item: ItemCarrinhoResponse,
    novaQuantidade: number,
    seletor?: MatSelect,
  ): void {
    this.alterarQuantidade({
      compradorIdentificador: this.compradorIdentificador,
      anuncioIdentificador: item.anuncioIdentificador,
      quantidade: novaQuantidade,
    }).subscribe((resultado) => {
      if (!resultado.sucesso && seletor) {
        seletor.writeValue(item.quantidade);
      }
    });
  }

  aoRemover(anuncioIdentificador: number): void {
    this.removerDoCarrinho({
      compradorIdentificador: this.compradorIdentificador,
      anuncioIdentificador,
    }).subscribe();
  }

  obterOpcoesQuantidade(estoque: number): number[] {
    return Array.from({ length: Math.max(0, Math.floor(estoque)) }, (_, indice) => indice + 1);
  }

  obterSubtotalCentavos(item: ItemCarrinhoResponse): number {
    return this.app.calcularSubtotalEmCentavos(item.precoUnitario, item.quantidade);
  }

  itemComPendencia(item: ItemCarrinhoResponse): boolean {
    return !item.disponivel || !this.app.quantidadeValida(item.quantidade, item.estoqueDisponivel);
  }

  avancar(): void {
    if (this.podeAvancar) {
      void this.roteador.navigate(['/pedidos/revisar']);
    }
  }

  private executar(
    operacao: Observable<ResultadoOperacaoCarrinho>,
  ): Observable<ResultadoOperacaoCarrinho> {
    return operacao.pipe(
      catchError((erro: Error) =>
        of({ sucesso: false, mensagem: erro.message, carrinho: this.carrinho() }),
      ),
      tap((resultado) => {
        if (this.app.dados.usaApi) {
          this.carrinhoDaApi.set(resultado.carrinho);
        }

        this.mensagemSinal.set(resultado.sucesso ? '' : resultado.mensagem);
      }),
    );
  }
}
