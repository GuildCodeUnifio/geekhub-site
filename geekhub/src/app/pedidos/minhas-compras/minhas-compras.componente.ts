import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  App,
  ESTADOS_PEDIDO,
  ROTULOS_ESTADO_PEDIDO,
  type EstadoPedido,
  type ListarComprasResponse,
} from '../../app';

interface FiltroEstado {
  rotulo: string;
  estado: EstadoPedido | undefined;
}

@Component({
  selector: 'app-minhas-compras',
  standalone: false,
  styleUrl: './minhas-compras.componente.scss',
  templateUrl: './minhas-compras.componente.html',
})
export class MinhasComprasComponente implements OnInit {
  private readonly app = inject(App);
  /** A aplicação é zoneless: respostas assíncronas da API precisam marcar a view para atualização. */
  private readonly detector = inject(ChangeDetectorRef);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private consultaAtual?: Subscription;

  readonly itensPorPagina = 4;
  readonly rotulosEstado = ROTULOS_ESTADO_PEDIDO;
  readonly filtros: FiltroEstado[] = [
    { rotulo: 'Todas', estado: undefined },
    ...ESTADOS_PEDIDO.map(estado => ({ rotulo: ROTULOS_ESTADO_PEDIDO[estado], estado })),
  ];

  estadoSelecionado: EstadoPedido | undefined = undefined;
  pagina = 1;
  resposta: ListarComprasResponse | null = null;
  carregando = false;
  erro = '';

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());

    if (!this.app.usuarioAtual) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/pedidos' },
      });
      return;
    }

    this.carregar();
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

  filtrar(estado: EstadoPedido | undefined): void {
    this.estadoSelecionado = estado;
    this.pagina = 1;
    this.carregar();
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex + 1;
    this.carregar();
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
      .listarCompras({
        compradorIdentificador: usuario.identificador,
        estado: this.estadoSelecionado,
        pagina: this.pagina,
        itensPorPagina: this.itensPorPagina,
      })
      .subscribe({
        next: resposta => {
          this.resposta = resposta;
          this.pagina = resposta.pagina;
          this.carregando = false;
          this.detector.markForCheck();
        },
        error: (erro: Error) => {
          this.erro = erro.message;
          this.carregando = false;
          this.detector.markForCheck();
        },
      });
  }
}
