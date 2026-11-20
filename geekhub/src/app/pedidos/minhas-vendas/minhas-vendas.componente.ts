import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  App,
  ESTADOS_PEDIDO,
  ROTULOS_ESTADO_PEDIDO,
  type EstadoPedido,
  type ListarVendasResponse,
} from '../../app';

interface FiltroEstadoVenda {
  rotulo: string;
  estado: EstadoPedido | undefined;
}

const PROXIMA_ETAPA: Readonly<Partial<Record<EstadoPedido, { estado: EstadoPedido; rotulo: string }>>> = {
  CRIADO: { estado: 'CONFIRMADO', rotulo: 'Confirmar' },
  CONFIRMADO: { estado: 'ENVIADO', rotulo: 'Enviar' },
  ENVIADO: { estado: 'CONCLUIDO', rotulo: 'Concluir' },
};

@Component({
  selector: 'app-minhas-vendas',
  standalone: false,
  templateUrl: './minhas-vendas.componente.html',
  styleUrl: './minhas-vendas.componente.scss',
})
export class MinhasVendasComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly itensPorPagina = 8;
  readonly rotulosEstado = ROTULOS_ESTADO_PEDIDO;
  readonly filtros: FiltroEstadoVenda[] = [
    { rotulo: 'Todas', estado: undefined },
    ...ESTADOS_PEDIDO.map(estado => ({ rotulo: ROTULOS_ESTADO_PEDIDO[estado], estado })),
  ];

  estadoSelecionado: EstadoPedido | undefined = undefined;
  incluirTodosAdmin = false;
  pagina = 1;
  resposta: ListarVendasResponse | null = null;
  carregando = false;
  processandoId: number | null = null;
  confirmandoCancelamentoId: number | null = null;
  confirmandoExclusaoId: number | null = null;
  erro = '';
  mensagem = '';

  private consultaAtual?: Subscription;

  get ehAdmin(): boolean {
    return this.app.usuarioAtualEhAdmin;
  }

  get inicioIntervalo(): number {
    return this.resposta && this.resposta.total > 0
      ? (this.resposta.pagina - 1) * this.resposta.itensPorPagina + 1
      : 0;
  }

  get fimIntervalo(): number {
    return this.resposta
      ? Math.min(this.resposta.pagina * this.resposta.itensPorPagina, this.resposta.total)
      : 0;
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());

    if (!this.app.usuarioAtual) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/pedidos/vendas' },
      });
      return;
    }

    if (this.ehAdmin) {
      this.incluirTodosAdmin = true;
    }

    this.carregar();
  }

  obterProximaEtapa(estado: EstadoPedido) {
    return PROXIMA_ETAPA[estado] ?? null;
  }

  podeCancelar(estado: EstadoPedido): boolean {
    return estado === 'CRIADO' || estado === 'CONFIRMADO';
  }

  filtrar(estado: EstadoPedido | undefined): void {
    this.estadoSelecionado = estado;
    this.pagina = 1;
    this.carregar();
  }

  alternarVisaoAdmin(marcado: boolean): void {
    this.incluirTodosAdmin = marcado;
    this.pagina = 1;
    this.carregar();
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex + 1;
    this.carregar();
  }

  avancarEstado(pedidoIdentificador: number, estadoAtual: EstadoPedido): void {
    const proximo = this.obterProximaEtapa(estadoAtual);
    if (!proximo) {
      return;
    }

    this.atualizarEstado(pedidoIdentificador, proximo.estado);
  }

  solicitarCancelamento(pedidoIdentificador: number): void {
    this.confirmandoCancelamentoId = pedidoIdentificador;
    this.confirmandoExclusaoId = null;
    this.erro = '';
    this.mensagem = '';
  }

  confirmarCancelamento(pedidoIdentificador: number): void {
    this.atualizarEstado(pedidoIdentificador, 'CANCELADO');
  }

  solicitarExclusao(pedidoIdentificador: number): void {
    this.confirmandoExclusaoId = pedidoIdentificador;
    this.confirmandoCancelamentoId = null;
    this.erro = '';
    this.mensagem = '';
  }

  confirmarExclusao(pedidoIdentificador: number): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || !this.ehAdmin || this.processandoId !== null) {
      return;
    }

    this.processandoId = pedidoIdentificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados.removerPedido(pedidoIdentificador, usuario.identificador).subscribe({
      next: resultado => {
        this.processandoId = null;
        this.confirmandoExclusaoId = null;

        if (!resultado.sucesso) {
          this.erro = resultado.mensagem;
          this.detector.markForCheck();
          return;
        }

        this.mensagem = resultado.mensagem;
        this.carregar();
      },
      error: (erro: Error) => {
        this.processandoId = null;
        this.confirmandoExclusaoId = null;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }

  carregar(): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario) {
      return;
    }

    this.consultaAtual?.unsubscribe();
    this.carregando = true;
    this.erro = '';

    this.consultaAtual = this.app.dados
      .listarVendas({
        vendedorIdentificador: usuario.identificador,
        estado: this.estadoSelecionado,
        pagina: this.pagina,
        itensPorPagina: this.itensPorPagina,
        incluirTodosAdmin: this.incluirTodosAdmin,
      })
      .subscribe({
        next: resposta => {
          this.resposta = resposta;
          this.pagina = resposta.pagina;
          this.carregando = false;
          this.detector.markForCheck();
        },
        error: (erro: Error) => {
          this.carregando = false;
          this.erro = erro.message;
          this.detector.markForCheck();
        },
      });
  }

  private atualizarEstado(pedidoIdentificador: number, novoEstado: EstadoPedido): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || this.processandoId !== null) {
      return;
    }

    this.processandoId = pedidoIdentificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados
      .atualizarEstadoPedido(pedidoIdentificador, usuario.identificador, novoEstado)
      .subscribe({
        next: resultado => {
          this.processandoId = null;
          this.confirmandoCancelamentoId = null;

          if (!resultado.sucesso) {
            this.erro = resultado.mensagem;
            this.detector.markForCheck();
            return;
          }

          this.mensagem = resultado.mensagem;
          this.carregar();
        },
        error: (erro: Error) => {
          this.processandoId = null;
          this.confirmandoCancelamentoId = null;
          this.erro = erro.message;
          this.detector.markForCheck();
        },
      });
  }
}
