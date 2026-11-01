import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('geekhub');

  usuarioAtual: UsuarioResponse | null = {
    identificador: 1,
    nome: 'Aluno exemplo',
    email: 'aluno@exemplo.com',
  };

  constructor(private roteador: Router) {}

  get versaoCabecalho(): 'Simples' | 'Completa' {
    return this.roteador.url.startsWith('/autenticacao/') ? 'Simples' : 'Completa';
  }

  encerrarSessao(): void {
    this.usuarioAtual = null;
    void this.roteador.navigate(['/autenticacao/entrar']);
  }
}
