import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  /** A aplicação é zoneless: respostas assíncronas da API precisam marcar a view para atualização. */
  private readonly detector = inject(ChangeDetectorRef);
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
        this.detector.markForCheck();

        if (carrinho.itens.length === 0) {
          void this.roteador.navigate(['/carrinho']);
        }
      },
      error: (erro: Error) => {
        this.carregando = false;
        this.mensagemErro = erro.message;
        this.detector.markForCheck();
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
        this.detector.markForCheck();
        return;
      }

      void this.roteador.navigate(['/pedidos', resultado.pedido.identificador]);
    });
  }

  voltarAoCarrinho(): void {
    void this.roteador.navigate(['/carrinho']);
  }
}
