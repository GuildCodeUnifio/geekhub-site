
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

interface EntrarRequest {
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  identificador: number;
  nome: string;
  email: string;
  foto?: string;
}

interface ContaFicticia extends UsuarioResponse {
  senha: string;
}

interface EntrarResultado {
  sucesso: boolean;
  mensagem: string;
  usuario?: UsuarioResponse;
}

@Component({
  selector: 'app-entrar',
  standalone: false,
  templateUrl: './entrar.componente.html',
  styleUrl: './entrar.componente.scss',
})
export class EntrarComponente {
  email = '';
  senha = '';
  senhaVisivel = false;
  mensagemErro = '';

  errosCampos: { email?: string; senha?: string } = {};
  usuarioAtual: UsuarioResponse | null = null;

  @Output() loginRealizado = new EventEmitter<UsuarioResponse>();

  private readonly contasFicticias: ContaFicticia[] = [
    {
      identificador: 1,
      nome: 'Usuário GeekHub',
      email: 'demo@geekhub.com',
      senha: '123456',
    },
    {
      identificador: 2,
      nome: 'Usuário Teste',
      email: 'teste@geekhub.com',
      senha: 'teste123',
    },
  ];

  constructor(private readonly roteador: Router) { }

  aoEnviar(): void {
    this.entrar({
      email: this.email,
      senha: this.senha,
    });
  }

  entrar(request: EntrarRequest): EntrarResultado {
    this.mensagemErro = '';
    this.errosCampos = {};
    this.usuarioAtual = null;

    const email = request.email.trim().toLowerCase();

    if (!email) {
      this.errosCampos.email = 'Informe seu e-mail.';
    }

    if (!request.senha.trim()) {
      this.errosCampos.senha = 'Informe sua senha.';
    }

    if (this.errosCampos.email || this.errosCampos.senha) {
      return {
        sucesso: false,
        mensagem: 'Preencha os campos obrigatórios.',
      };
    }

    const conta = this.contasFicticias.find(
      usuario =>
        usuario.email === email &&
        usuario.senha === request.senha
    );

    if (!conta) {
      this.mensagemErro = 'E-mail ou senha incorretos.';

      return {
        sucesso: false,
        mensagem: this.mensagemErro,
      };
    }

    const usuario: UsuarioResponse = {
      identificador: conta.identificador,
      nome: conta.nome,
      email: conta.email,
      foto: conta.foto,
    };

    this.usuarioAtual = usuario;
    this.loginRealizado.emit(usuario);

    void this.roteador.navigate(['/']);

    return {
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      usuario,
    };
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  limparErroCampo(campo: 'email' | 'senha'): void {
    delete this.errosCampos[campo];
    this.mensagemErro = '';
  }
}
