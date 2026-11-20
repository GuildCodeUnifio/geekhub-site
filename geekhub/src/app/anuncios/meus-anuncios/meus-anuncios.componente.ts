import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { App, type ListarMeusAnunciosResponse } from '../../app';

@Component({
  selector: 'app-meus-anuncios',
  standalone: false,
  templateUrl: './meus-anuncios.componente.html',
  styleUrl: './meus-anuncios.componente.scss',
})
export class MeusAnunciosComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly itensPorPagina = 8;
  pagina = 1;
  exibirTodosAdmin = false;
  resposta: ListarMeusAnunciosResponse | null = null;
  carregando = false;
  erro = '';
  mensagem = '';
  confirmandoExclusaoId: number | null = null;
  removendoId: number | null = null;

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
        queryParams: { redirecionar: '/meus-anuncios' },
      });
      return;
    }

    this.carregar();
  }

  alternarVisaoAdmin(marcado: boolean): void {
    this.exibirTodosAdmin = marcado;
    this.pagina = 1;
    this.confirmandoExclusaoId = null;
    this.carregar();
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex + 1;
    this.carregar();
  }

  solicitarExclusao(identificador: number): void {
    this.confirmandoExclusaoId = identificador;
    this.erro = '';
    this.mensagem = '';
  }

  cancelarExclusao(): void {
    this.confirmandoExclusaoId = null;
  }

  confirmarExclusao(identificador: number): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || this.removendoId !== null) {
      return;
    }

    this.removendoId = identificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados.removerAnuncio(identificador, usuario.identificador).subscribe({
      next: resultado => {
        this.removendoId = null;
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
        this.removendoId = null;
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
      .listarMeusAnuncios(
        usuario.identificador,
        this.pagina,
        this.itensPorPagina,
        this.exibirTodosAdmin,
      )
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
}
