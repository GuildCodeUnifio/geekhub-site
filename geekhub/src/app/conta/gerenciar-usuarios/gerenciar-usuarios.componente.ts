import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { App, type ListarUsuariosResponse, type UsuarioAdminResponse } from '../../app';

@Component({
  selector: 'app-gerenciar-usuarios',
  standalone: false,
  templateUrl: './gerenciar-usuarios.componente.html',
  styleUrl: './gerenciar-usuarios.componente.scss',
})
export class GerenciarUsuariosComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly itensPorPagina = 10;
  pagina = 1;
  resposta: ListarUsuariosResponse | null = null;
  carregando = false;
  processandoId: number | null = null;
  confirmandoExclusaoId: number | null = null;
  erro = '';
  mensagem = '';

  private consultaAtual?: Subscription;

  get ehAdmin(): boolean {
    return this.app.usuarioAtualEhAdmin;
  }

  get usuarioAtualIdentificador(): number | null {
    return this.app.usuarioAtual?.identificador ?? null;
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());

    if (!this.app.usuarioAtual) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/minha-conta/usuarios' },
      });
      return;
    }

    if (this.ehAdmin) {
      this.carregar();
    }
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex + 1;
    this.carregar();
  }

  alternarAdmin(usuario: UsuarioAdminResponse, admin: boolean): void {
    const solicitante = this.app.usuarioAtual;
    if (!solicitante || !this.ehAdmin || this.processandoId !== null) {
      return;
    }

    this.processandoId = usuario.identificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados
      .atualizarPermissaoUsuario(usuario.identificador, solicitante.identificador, admin)
      .subscribe({
        next: resultado => {
          this.processandoId = null;
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
          this.erro = erro.message;
          this.detector.markForCheck();
        },
      });
  }

  solicitarExclusao(identificador: number): void {
    this.confirmandoExclusaoId = identificador;
    this.erro = '';
    this.mensagem = '';
  }

  confirmarExclusao(identificador: number): void {
    const solicitante = this.app.usuarioAtual;
    if (!solicitante || !this.ehAdmin || this.processandoId !== null) {
      return;
    }

    this.processandoId = identificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados.removerUsuario(identificador, solicitante.identificador).subscribe({
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
    const solicitante = this.app.usuarioAtual;
    if (!solicitante) {
      return;
    }

    this.consultaAtual?.unsubscribe();
    this.carregando = true;
    this.erro = '';

    this.consultaAtual = this.app.dados
      .listarUsuarios(solicitante.identificador, this.pagina, this.itensPorPagina)
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
