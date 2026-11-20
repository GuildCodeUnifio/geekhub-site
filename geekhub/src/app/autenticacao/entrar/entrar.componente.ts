import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

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
  private readonly rota = inject(ActivatedRoute, { optional: true });

  email = '';
  senha = '';
  senhaVisivel = false;
  mensagemErro = '';
  enviando = false;

  errosCampos: ErrosCamposEntrar = {};
  usuarioAtual: UsuarioResponse | null = null;

  aoEnviar(): void {
    if (this.enviando) {
      return;
    }

    this.entrar({
      email: this.email,
      senha: this.senha,
    }).subscribe();
  }

  entrar(request: EntrarRequest): Observable<boolean> {
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
      return of(false);
    }

    this.enviando = true;

    return this.app.dados.entrar({ email, senha: request.senha }).pipe(
      map(usuario => {
        this.enviando = false;

        if (!usuario) {
          this.mensagemErro = 'E-mail ou senha incorretos.';
          return false;
        }

        this.usuarioAtual = usuario;
        this.redirecionarAposEntrar();
        return true;
      }),
      catchError((erro: Error) => {
        this.enviando = false;
        this.mensagemErro = erro.message;
        return of(false);
      }),
    );
  }

  private redirecionarAposEntrar(): void {
    const redirecionar = this.rota?.snapshot.queryParamMap.get('redirecionar') ?? '';
    if (redirecionar.startsWith('/') && !redirecionar.startsWith('//')) {
      void this.roteador.navigateByUrl(redirecionar);
    } else {
      void this.roteador.navigate(['/']);
    }
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  limparErroCampo(campo: keyof ErrosCamposEntrar): void {
    delete this.errosCampos[campo];
    this.mensagemErro = '';
  }
}
