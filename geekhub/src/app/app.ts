
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  signal,
} from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

interface ComponenteComLogin {
  loginRealizado: EventEmitter<UsuarioResponse>;
}

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  protected readonly title = signal('geekhub');

  // Visitante inicia sem sessão simulada
  usuarioAtual: UsuarioResponse | null = null;

  private assinaturaLogin?: Subscription;

  constructor(
    private readonly roteador: Router,
    private readonly detector: ChangeDetectorRef,
  ) { }

  // Define qual versão do cabeçalho será exibida
  get versaoCabecalho(): 'Simples' | 'Completa' {
    const caminho = this.roteador.url.split('?')[0];

    return caminho === '/entrar' ||
      caminho === '/cadastro' ||
      caminho.startsWith('/autenticacao/')
      ? 'Simples'
      : 'Completa';
  }

  // Recebe a instância do componente carregado na rota
  aoAtivarRota(componente: unknown): void {
    this.aoDesativarRota();

    if (this.possuiEventoLogin(componente)) {
      this.assinaturaLogin =
        componente.loginRealizado.subscribe((usuario) => {
          this.usuarioAtual = usuario;
          this.detector.markForCheck();
        });
    }
  }

  // Encerra a inscrição quando a tela é destruída
  aoDesativarRota(): void {
    this.assinaturaLogin?.unsubscribe();
    this.assinaturaLogin = undefined;
  }

  // Confere se o componente possui o evento de login
  private possuiEventoLogin(
    componente: unknown
  ): componente is ComponenteComLogin {
    return (
      typeof componente === 'object' &&
      componente !== null &&
      'loginRealizado' in componente &&
      componente.loginRealizado instanceof EventEmitter
    );
  }

  // Navegação de pesquisa do cabeçalho
  pesquisar(termo: string): void {
    void this.roteador.navigate(['/'], {
      queryParams: {
        busca: termo || null
      },
    });
  }

  // Subtask #36: encerrar sessão
  sair(): void {
    this.usuarioAtual = null;
    this.detector.markForCheck();

    void this.roteador.navigate(['/entrar']);
  }

  ngOnDestroy(): void {
    this.aoDesativarRota();
  }
}
