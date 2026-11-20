import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { App, type CarrinhoResponse } from '../../app';
import type { UsuarioResponse } from '../../cabecalho/cabecalho/cabecalho';

@Component({
  selector: 'app-revisar-pedido',
  standalone: false,
  styleUrl: './revisar-pedido.componente.scss',
  templateUrl: './revisar-pedido.componente.html',
})
export class RevisarPedidoComponente implements OnInit {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);

  comprador: UsuarioResponse | null = null;
  carrinho: CarrinhoResponse | null = null;
  mensagemErro = '';
  confirmando = false;
  carregando = false;

  ngOnInit(): void {
    this.comprador = this.app.usuarioAtual;

    if (!this.comprador) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/pedidos/revisar' },
      });
      return;
    }

    this.carregando = true;
    this.app.dados.consultarCarrinho(this.comprador.identificador).subscribe({
      next: carrinho => {
        this.carregando = false;
        this.carrinho = carrinho;

        if (carrinho.itens.length === 0) {
          void this.roteador.navigate(['/carrinho']);
        }
      },
      error: (erro: Error) => {
        this.carregando = false;
        this.mensagemErro = erro.message;
      },
    });
  }

  confirmarPedido(): void {
    if (!this.comprador || this.confirmando) {
      return;
    }

    this.confirmando = true;
    this.mensagemErro = '';

    this.app.dados.criarPedido(this.comprador.identificador).subscribe(resultado => {
      if (!resultado.sucesso || !resultado.pedido) {
        this.mensagemErro = resultado.mensagem;
        this.confirmando = false;
        return;
      }

      void this.roteador.navigate(['/pedidos', resultado.pedido.identificador]);
    });
  }

  voltarAoCarrinho(): void {
    void this.roteador.navigate(['/carrinho']);
  }
}
