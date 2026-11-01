import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('geekhub');

  constructor(private roteador: Router) {}

  get versaoCabecalho(): 'Simples' | 'Completa' {
    return this.roteador.url.startsWith('/autenticacao/') ? 'Simples' : 'Completa';
  }
}
