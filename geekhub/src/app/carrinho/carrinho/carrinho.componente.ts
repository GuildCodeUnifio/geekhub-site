import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

export interface CarrinhoItem {
  id: number;
  disponivel: boolean;
  titulo: string;
  imagemUrl: string;
  preco: number;
  quantidade: number;
  estoqueDisponivel: number;
}

@Component({
  selector: 'app-carrinho',
  standalone: false,
  styleUrls: ['./carrinho.componente.scss'],
  templateUrl: './carrinho.componente.html',
})
export class CarrinhoComponente {

  colunasExibidas: string[] = ['produto', 'preco', 'quantidade', 'subtotal', 'acao'];

  compradorIdentificador = 1;
  mensagem = '';

  private carrinhos = new Map<number, CarrinhoItem[]>([[1, [
    {
      disponivel: true,
      id: 1,
      titulo: 'Card de anúncio 1',
      imagemUrl: 'https://placehold.co/64x64/png?text=Produto',
      preco: 49.90,
      quantidade: 1,
      estoqueDisponivel: 5
    },
    {
      disponivel: true,
      id: 2,
      titulo: 'Card de anúncio 2',
      imagemUrl: 'https://placehold.co/64x64/png?text=Produto',
      preco: 120.00,
      quantidade: 2,
      estoqueDisponivel: 3
    },
    {
      disponivel: true,
      id: 3,
      titulo: 'Card de anúncio 3',
      imagemUrl: 'https://placehold.co/64x64/png?text=Produto',
      preco: 85.50,
      quantidade: 3,
      estoqueDisponivel: 10
    }
  ]]]);

  constructor(private roteador: Router) {}

  get itensCarrinho(): CarrinhoItem[] {
    return this.consultarCarrinho(this.compradorIdentificador);
  }

  consultarCarrinho(compradorIdentificador: number): CarrinhoItem[] {
    return this.carrinhos.get(compradorIdentificador) ?? [];
  }

  adicionarItem(compradorIdentificador: number, anuncio: CarrinhoItem, quantidade: number): void {
    const itens = this.consultarCarrinho(compradorIdentificador);
    const existente = itens.find(item => item.id === anuncio.id);
    const novaQuantidade = (existente?.quantidade ?? 0) + quantidade;
    if (!this.quantidadeValida(anuncio, quantidade) ||
        !this.quantidadeValida(anuncio, novaQuantidade)) {
      this.mensagem = 'Não foi possível adicionar: confira a quantidade e a disponibilidade do anúncio.';
      return;
    }
    if (existente) {
      existente.quantidade = novaQuantidade;
      existente.disponivel = anuncio.disponivel;
      existente.estoqueDisponivel = anuncio.estoqueDisponivel;
    } else {
      itens.push({ ...anuncio, quantidade });
    }
    this.carrinhos.set(compradorIdentificador, [...itens]);
    this.mensagem = '';
  }

  obterOpcoesQuantidade(estoque: number): number[] {
    return Array.from({ length: Math.max(0, Math.floor(estoque)) }, (_, indice) => indice + 1);
  }

  private quantidadeValida(item: CarrinhoItem, quantidade: number): boolean {
    return item.disponivel && Number.isInteger(quantidade) &&
      quantidade >= 1 && quantidade <= item.estoqueDisponivel;
  }

  alterarQuantidade(item: CarrinhoItem, novaQuantidade: number): void {
    if (!this.quantidadeValida(item, novaQuantidade)) {
      this.mensagem = 'Quantidade inválida ou anúncio indisponível. Informe um inteiro de 1 até o estoque disponível.';
      return;
    }
    item.quantidade = novaQuantidade;
    this.mensagem = '';
  }

  removerItem(id: number): void {
    this.carrinhos.set(this.compradorIdentificador, this.itensCarrinho.filter(item => item.id !== id));
  }

  obterSubtotalCentavos(item: CarrinhoItem): number {
    return Math.round(item.preco * 100) * item.quantidade;
  }

  get valorTotal(): number {
    return this.itensCarrinho.reduce((total, item) => total + this.obterSubtotalCentavos(item), 0) / 100;
  }

  get podeAvancar(): boolean {
    return this.itensCarrinho.length > 0 &&
      this.itensCarrinho.every(item => this.quantidadeValida(item, item.quantidade));
  }

  avancar(): void {
    if (this.podeAvancar) {
      this.roteador.navigate(['/pedidos/revisar']);
    }
  }
}
