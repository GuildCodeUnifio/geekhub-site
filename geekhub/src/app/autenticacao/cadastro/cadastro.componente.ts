import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private readonly snackBar = inject(MatSnackBar);

  nome = '';
  email = '';
  senha = '';
  confirmacaoSenha = '';
  cadastroConcluido = false;
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
    if (this.cadastroConcluido) {
      return;
    }

    const resultado = this.cadastrarUsuario({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      confirmacaoSenha: this.confirmacaoSenha,
    });

    if (resultado.sucesso) {
      this.cadastroConcluido = true;
      this.snackBar.open(resultado.mensagem, 'Fechar', {
        duration: 4000,
      });
      void this.roteador.navigate(['/entrar']);
    }
  }

  cadastrarUsuario(request: CadastroRequest): CadastroResultado {
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
      return {
        sucesso: false,
        mensagem: primeiroErro,
      };
    }

    const usuario = this.app.cadastrar({
      nome,
      email,
      senha: request.senha,
    });

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