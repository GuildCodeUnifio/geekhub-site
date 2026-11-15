import { Component, computed, inject, signal } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';

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
export class CarrinhoComponente {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);

  private readonly compradorSelecionado = signal<number | undefined>(undefined);
  private readonly mensagemSinal = signal('');

  readonly colunasExibidas: string[] = ['produto', 'preco', 'quantidade', 'subtotal', 'acao'];

  readonly carrinho = computed<CarrinhoResponse>(() => {
    this.app.versaoEstadoCarrinhos;
    return this.app.consultarCarrinho(this.compradorIdentificador);
  });

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

  consultarCarrinho(compradorIdentificador = this.compradorIdentificador): CarrinhoResponse {
    return this.app.consultarCarrinho(compradorIdentificador);
  }

  adicionarAoCarrinho(request: AdicionarAoCarrinhoRequest): ResultadoOperacaoCarrinho {
    const resultado = this.app.adicionarAoCarrinho(request);
    this.aplicarResultado(resultado);
    return resultado;
  }

  alterarQuantidade(request: AlterarQuantidadeRequest): ResultadoOperacaoCarrinho {
    const resultado = this.app.alterarQuantidadeCarrinho(request);
    this.aplicarResultado(resultado);
    return resultado;
  }

  removerDoCarrinho(request: RemoverDoCarrinhoRequest): ResultadoOperacaoCarrinho {
    const resultado = this.app.removerDoCarrinho(request);
    this.aplicarResultado(resultado);
    return resultado;
  }

  aoSelecionarQuantidade(
    item: ItemCarrinhoResponse,
    novaQuantidade: number,
    seletor?: MatSelect,
  ): void {
    const resultado = this.alterarQuantidade({
      compradorIdentificador: this.compradorIdentificador,
      anuncioIdentificador: item.anuncioIdentificador,
      quantidade: novaQuantidade,
    });

    if (!resultado.sucesso && seletor) {
      seletor.writeValue(item.quantidade);
    }
  }

  aoRemover(anuncioIdentificador: number): void {
    this.removerDoCarrinho({
      compradorIdentificador: this.compradorIdentificador,
      anuncioIdentificador,
    });
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

  private aplicarResultado(resultado: ResultadoOperacaoCarrinho): void {
    this.mensagemSinal.set(resultado.sucesso ? '' : resultado.mensagem);
  }
}
