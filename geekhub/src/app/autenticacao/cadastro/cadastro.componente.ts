import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, map, of } from 'rxjs';

import { App } from '../../app';
import type { UsuarioResponse } from '../../cabecalho/cabecalho/cabecalho';

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
}

export interface ErrosCamposCadastro {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacaoSenha?: string;
}

export interface CadastroResultado {
  sucesso: boolean;
  mensagem: string;
  usuario?: UsuarioResponse;
}

@Component({
  selector: 'app-cadastro',
  standalone: false,
  styleUrl: './cadastro.componente.scss',
  templateUrl: './cadastro.componente.html',
})
export class CadastroComponente {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);
  /** A aplicação é zoneless: respostas assíncronas da API precisam marcar a view para atualização. */
  private readonly detector = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  nome = '';
  email = '';
  senha = '';
  confirmacaoSenha = '';
  cadastroConcluido = false;
  enviando = false;
  /** Erro que não pertence a um campo específico (ex.: API indisponível). */
  erroGeral = '';
  errosCampos: ErrosCamposCadastro = {};

  senhaVisivel = false;
  confirmacaoSenhaVisivel = false;

  readonly erroNome = {
    isErrorState: () => Boolean(this.errosCampos.nome),
  };

  readonly erroEmail = {
    isErrorState: () => Boolean(this.errosCampos.email),
  };

  readonly erroSenha = {
    isErrorState: () => Boolean(this.errosCampos.senha),
  };

  readonly erroConfirmacao = {
    isErrorState: () => Boolean(this.errosCampos.confirmacaoSenha),
  };

  cadastrar(): void {
    if (this.cadastroConcluido || this.enviando) {
      return;
    }

    this.cadastrarUsuario({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      confirmacaoSenha: this.confirmacaoSenha,
    }).subscribe(resultado => {
      if (resultado.sucesso) {
        this.cadastroConcluido = true;
        this.snackBar.open(resultado.mensagem, 'Fechar', {
          duration: 4000,
        });
        void this.roteador.navigate(['/entrar']);
      } else if (this.erroGeral) {
        this.snackBar.open(this.erroGeral, 'Fechar', { duration: 5000 });
      }
    });
  }

  cadastrarUsuario(request: CadastroRequest): Observable<CadastroResultado> {
    this.errosCampos = {};

    const nome = request.nome.trim();
    const email = request.email.trim().toLowerCase();

    if (!nome) {
      this.errosCampos.nome = 'Informe seu nome.';
    }

    if (!email) {
      this.errosCampos.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errosCampos.email = 'Informe um e-mail válido.';
    }

    if (!request.senha.trim()) {
      this.errosCampos.senha = 'Informe uma senha.';
    }

    if (!request.confirmacaoSenha) {
      this.errosCampos.confirmacaoSenha = 'Confirme sua senha.';
    } else if (request.confirmacaoSenha !== request.senha) {
      this.errosCampos.confirmacaoSenha = 'As senhas não coincidem.';
    }

    const primeiroErro =
      this.errosCampos.nome ??
      this.errosCampos.email ??
      this.errosCampos.senha ??
      this.errosCampos.confirmacaoSenha;

    if (primeiroErro) {
      return of({
        sucesso: false,
        mensagem: primeiroErro,
      });
    }

    this.enviando = true;
    this.erroGeral = '';

    return this.app.dados.cadastrar({ nome, email, senha: request.senha }).pipe(
      map((usuario): CadastroResultado => {
        this.enviando = false;
        this.detector.markForCheck();

        if (!usuario) {
          const mensagem = 'E-mail já cadastrado';
          this.errosCampos.email = mensagem;
          return { sucesso: false, mensagem };
        }

        return {
          sucesso: true,
          mensagem: 'Conta criada com sucesso!',
          usuario,
        };
      }),
      catchError((erro: Error) => {
        this.enviando = false;
        this.erroGeral = erro.message;
        this.detector.markForCheck();
        return of({ sucesso: false, mensagem: erro.message });
      }),
    );
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  alternarVisibilidadeConfirmacaoSenha(): void {
    this.confirmacaoSenhaVisivel = !this.confirmacaoSenhaVisivel;
  }

  limparErroCampo(campo: keyof ErrosCamposCadastro): void {
    delete this.errosCampos[campo];

    if (
      campo === 'senha' &&
      this.errosCampos.confirmacaoSenha === 'As senhas não coincidem.'
    ) {
      delete this.errosCampos.confirmacaoSenha;
    }
  }
}