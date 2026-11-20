import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  /** A aplicação é zoneless: respostas assíncronas da API precisam marcar a view para atualização. */
  private readonly detector = inject(ChangeDetectorRef);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly rotulosEstado = ROTULOS_ESTADO_PEDIDO;
  readonly notas = [1, 2, 3, 4, 5];

  pedido: PedidoResponse | null = null;
  etapas: EtapaPedido[] = [];
  erro = '';
  carregando = false;
  enviandoAvaliacao = false;
  atualizandoEstado = false;
  confirmandoCancelamento = false;
  mensagemEstado = '';
  estadoComErro = false;

  private consultaAtual?: Subscription;

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

      this.consultaAtual?.unsubscribe();
      this.cancelarAvaliacao();
      this.mensagemAvaliacao = '';
      this.confirmandoCancelamento = false;
      this.mensagemEstado = '';
      this.estadoComErro = false;
      this.pedido = null;
      this.etapas = [];
      this.erro = '';

      if (!Number.isInteger(identificador) || identificador < 1) {
        this.erro = 'Pedido não encontrado.';
        return;
      }

      this.carregando = true;
      this.consultaAtual = this.app.dados
        .detalharPedido(usuario.identificador, identificador)
        .subscribe({
          next: pedido => {
            this.carregando = false;
            this.pedido = pedido;
            this.erro = pedido ? '' : 'Pedido não encontrado.';
            this.etapas = pedido ? this.montarEtapas(pedido) : [];
            this.detector.markForCheck();
          },
          error: (erro: Error) => {
            this.carregando = false;
            this.erro = erro.message;
            this.detector.markForCheck();
          },
        });
    });

    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());
  }

  get podeAvaliar(): boolean {
    return this.pedido?.estado === 'CONCLUIDO' && !this.pedido.avaliado;
  }

  get ehVendedorOuAdmin(): boolean {
    const usuario = this.app.usuarioAtual;
    if (!usuario || !this.pedido) {
      return false;
    }

    return (
      this.app.usuarioAtualEhAdmin ||
      this.pedido.itens.some(item => item.vendedorIdentificador === usuario.identificador)
    );
  }

  get proximoEstado(): { estado: EstadoPedido; rotulo: string } | null {
    switch (this.pedido?.estado) {
      case 'CRIADO':
        return { estado: 'CONFIRMADO', rotulo: 'Confirmar pedido' };
      case 'CONFIRMADO':
        return { estado: 'ENVIADO', rotulo: 'Marcar como enviado' };
      case 'ENVIADO':
        return { estado: 'CONCLUIDO', rotulo: 'Marcar como concluído' };
      default:
        return null;
    }
  }

  get podeAvancarEstado(): boolean {
    return this.ehVendedorOuAdmin && this.proximoEstado !== null;
  }

  get podeCancelarPedido(): boolean {
    return this.pedido?.estado === 'CRIADO' || this.pedido?.estado === 'CONFIRMADO';
  }

  avancarEstado(): void {
    const proximo = this.proximoEstado;
    if (!proximo) {
      return;
    }

    this.alterarEstadoPedido(proximo.estado);
  }

  solicitarCancelamento(): void {
    this.confirmandoCancelamento = true;
    this.mensagemEstado = '';
  }

  desistirCancelamento(): void {
    this.confirmandoCancelamento = false;
  }

  confirmarCancelamento(): void {
    this.alterarEstadoPedido('CANCELADO');
  }

  private alterarEstadoPedido(novoEstado: EstadoPedido): void {
    const usuario = this.app.usuarioAtual;
    if (!this.pedido || !usuario || this.atualizandoEstado) {
      return;
    }

    this.atualizandoEstado = true;
    this.mensagemEstado = '';
    this.estadoComErro = false;

    this.app.dados
      .atualizarEstadoPedido(this.pedido.identificador, usuario.identificador, novoEstado)
      .subscribe({
        next: resultado => {
          this.atualizandoEstado = false;
          this.confirmandoCancelamento = false;
          this.estadoComErro = !resultado.sucesso;
          this.mensagemEstado = resultado.mensagem;

          if (resultado.pedido) {
            this.pedido = resultado.pedido;
            this.etapas = this.montarEtapas(resultado.pedido);
          }

          this.detector.markForCheck();
        },
        error: (erro: Error) => {
          this.atualizandoEstado = false;
          this.confirmandoCancelamento = false;
          this.estadoComErro = true;
          this.mensagemEstado = erro.message;
          this.detector.markForCheck();
        },
      });
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

    if (this.enviandoAvaliacao) {
      return;
    }

    this.enviandoAvaliacao = true;

    this.app.dados
      .avaliarPedido({
        compradorIdentificador: usuario.identificador,
        pedidoIdentificador: this.pedido.identificador,
        nota: this.nota,
        comentario: this.comentario,
      })
      .subscribe(resultado => {
        this.enviandoAvaliacao = false;
        this.detector.markForCheck();
        this.avaliacaoComErro = !resultado.sucesso;
        this.mensagemAvaliacao = resultado.mensagem;

        if (resultado.pedido) {
          this.pedido = resultado.pedido;
          this.etapas = this.montarEtapas(resultado.pedido);
        }

        if (resultado.sucesso) {
          this.cancelarAvaliacao();
        }
      });
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
