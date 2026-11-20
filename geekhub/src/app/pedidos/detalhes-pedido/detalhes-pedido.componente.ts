import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import {
  App,
  ROTULOS_ESTADO_PEDIDO,
  type EstadoPedido,
  type PedidoResponse,
} from '../../app';

export interface EtapaPedido {
  estado: EstadoPedido;
  rotulo: string;
  ocorridoEm: string | null;
}

const FLUXO_PEDIDO: readonly EstadoPedido[] = ['CRIADO', 'CONFIRMADO', 'ENVIADO', 'CONCLUIDO'];

@Component({
  selector: 'app-detalhes-pedido',
  standalone: false,
  styleUrl: './detalhes-pedido.componente.scss',
  templateUrl: './detalhes-pedido.componente.html',
})
export class DetalhesPedidoComponente implements OnInit {
  private readonly app = inject(App);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly rotulosEstado = ROTULOS_ESTADO_PEDIDO;
  readonly notas = [1, 2, 3, 4, 5];

  pedido: PedidoResponse | null = null;
  etapas: EtapaPedido[] = [];
  erro = '';

  avaliando = false;
  nota = 0;
  comentario = '';
  mensagemAvaliacao = '';
  avaliacaoComErro = false;

  ngOnInit(): void {
    this.rota.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parametros => {
      const identificador = Number(parametros.get('id'));
      const usuario = this.app.usuarioAtual;

      if (!usuario) {
        void this.roteador.navigate(['/entrar'], {
          queryParams: { redirecionar: `/pedidos/${parametros.get('id') ?? ''}` },
        });
        return;
      }

      this.pedido = Number.isInteger(identificador)
        ? this.app.detalharPedido(usuario.identificador, identificador)
        : null;
      this.erro = this.pedido ? '' : 'Pedido não encontrado.';
      this.etapas = this.pedido ? this.montarEtapas(this.pedido) : [];
      this.cancelarAvaliacao();
      this.mensagemAvaliacao = '';
    });
  }

  get podeAvaliar(): boolean {
    return this.pedido?.estado === 'CONCLUIDO' && !this.pedido.avaliado;
  }

  abrirAvaliacao(): void {
    this.avaliando = true;
    this.mensagemAvaliacao = '';
  }

  cancelarAvaliacao(): void {
    this.avaliando = false;
    this.nota = 0;
    this.comentario = '';
  }

  enviarAvaliacao(): void {
    const usuario = this.app.usuarioAtual;
    if (!this.pedido || !usuario) {
      return;
    }

    if (this.nota < 1) {
      this.avaliacaoComErro = true;
      this.mensagemAvaliacao = 'Selecione uma nota de 1 a 5.';
      return;
    }

    const resultado = this.app.avaliarPedido({
      compradorIdentificador: usuario.identificador,
      pedidoIdentificador: this.pedido.identificador,
      nota: this.nota,
      comentario: this.comentario,
    });

    this.avaliacaoComErro = !resultado.sucesso;
    this.mensagemAvaliacao = resultado.mensagem;

    if (resultado.pedido) {
      this.pedido = resultado.pedido;
    }

    if (resultado.sucesso) {
      this.cancelarAvaliacao();
    }
  }

  private montarEtapas(pedido: PedidoResponse): EtapaPedido[] {
    if (pedido.estado === 'CANCELADO') {
      return pedido.historico.map(evento => ({
        estado: evento.estado,
        rotulo: ROTULOS_ESTADO_PEDIDO[evento.estado],
        ocorridoEm: evento.ocorridoEm,
      }));
    }

    return FLUXO_PEDIDO.map(estado => ({
      estado,
      rotulo: ROTULOS_ESTADO_PEDIDO[estado],
      ocorridoEm: pedido.historico.find(evento => evento.estado === estado)?.ocorridoEm ?? null,
    }));
  }
}
