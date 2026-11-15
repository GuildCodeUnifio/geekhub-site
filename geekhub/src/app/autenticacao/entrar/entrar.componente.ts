import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { App } from '../../app';
import type { UsuarioResponse } from '../../cabecalho/cabecalho/cabecalho';

export interface EntrarRequest {
  email: string;
  senha: string;
}

export interface ErrosCamposEntrar {
  email?: string;
  senha?: string;
}

@Component({
  selector: 'app-entrar',
  standalone: false,
  templateUrl: './entrar.componente.html',
  styleUrl: './entrar.componente.scss',
})
export class EntrarComponente {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);

  email = '';
  senha = '';
  senhaVisivel = false;
  mensagemErro = '';

  errosCampos: ErrosCamposEntrar = {};
  usuarioAtual: UsuarioResponse | null = null;

  aoEnviar(): void {
    this.entrar({
      email: this.email,
      senha: this.senha,
    });
  }

  entrar(request: EntrarRequest): boolean {
    this.mensagemErro = '';
    this.errosCampos = {};
    this.usuarioAtual = null;

    const email = request.email.trim().toLowerCase();

    if (!email) {
      this.errosCampos.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errosCampos.email = 'Informe um e-mail válido.';
    }

    if (!request.senha.trim()) {
      this.errosCampos.senha = 'Informe sua senha.';
    }

    if (this.errosCampos.email || this.errosCampos.senha) {
      return false;
    }

    const usuario = this.app.entrar({
      email,
      senha: request.senha,
    });

    if (!usuario) {
      this.mensagemErro = 'E-mail ou senha incorretos.';
      return false;
    }

    this.usuarioAtual = usuario;

    void this.roteador.navigate(['/']);

    return true;
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  limparErroCampo(campo: keyof ErrosCamposEntrar): void {
    delete this.errosCampos[campo];
    this.mensagemErro = '';
  }
}
