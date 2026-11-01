import { Component, OnInit } from '@angular/core';

export interface CarrinhoItem {
  id: number;
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
export class CarrinhoComponente implements OnInit {

  displayedColumns: string[] = ['produto', 'preco', 'quantidade', 'subtotal', 'acao'];

  itensCarrinho: CarrinhoItem[] = [
    {
      id: 1,
      titulo: 'Card de anúncio 1',
      imagemUrl: 'assets/placeholder.png',
      preco: 49.90,
      quantidade: 1,
      estoqueDisponivel: 5
    },
    {
      id: 2,
      titulo: 'Card de anúncio 2',
      imagemUrl: 'assets/placeholder.png',
      preco: 120.00,
      quantidade: 2,
      estoqueDisponivel: 3
    },
    {
      id: 3,
      titulo: 'Card de anúncio 3',
      imagemUrl: 'assets/placeholder.png',
      preco: 85.50,
      quantidade: 3,
      estoqueDisponivel: 10
    }
  ];

  ngOnInit(): void {}

  getOpcoesQuantidade(estoque: number): number[] {
    const max = Math.min(estoque, 10);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  alterarQuantidade(item: CarrinhoItem, novaQuantidade: number): void {
    if (novaQuantidade > 0 && novaQuantidade <= item.estoqueDisponivel) {
      item.quantidade = novaQuantidade;
    }
  }

  removerItem(id: number): void {
    this.itensCarrinho = this.itensCarrinho.filter(item => item.id !== id);
  }

  get valorTotal(): number {
    return this.itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  avancar(): void {
    if (this.itensCarrinho.length > 0) {
      console.log('Avançando para checkout com itens:', this.itensCarrinho);
    }
  }
}
