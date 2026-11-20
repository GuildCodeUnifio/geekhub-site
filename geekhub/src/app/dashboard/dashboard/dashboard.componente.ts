import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  App,
  ROTULOS_ESTADO_PEDIDO,
  type DashboardOperacionalResponse,
  type EstadoPedido,
} from '../../app';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.componente.html',
  styleUrl: './dashboard.componente.scss',
})
export class DashboardComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly rotulosEstado = ROTULOS_ESTADO_PEDIDO;
  readonly colunasRecentes: string[] = ['pedido', 'comprador', 'estado', 'itens', 'valor', 'data'];

  dados: DashboardOperacionalResponse | null = null;
  carregando = false;
  erro = '';

  private consultaAtual?: Subscription;

  get usuarioAutenticado(): boolean {
    return this.app.usuarioAtual !== null;
  }

  get ehAdmin(): boolean {
    return this.app.usuarioAtualEhAdmin;
  }

  obterRotuloEstado(estado: EstadoPedido): string {
    return this.rotulosEstado[estado];
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());
    this.carregar();
  }

  carregar(): void {
    this.consultaAtual?.unsubscribe();
    this.carregando = true;
    this.erro = '';

    this.consultaAtual = this.app.dados.carregarDashboard().subscribe({
      next: dados => {
        this.dados = dados;
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
}
