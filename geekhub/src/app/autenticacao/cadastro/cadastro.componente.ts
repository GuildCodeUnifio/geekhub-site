import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto?: string;
}

interface ContaFicticia extends Usuario {
  senha: string;
}

interface CadastroResultado {
  sucesso: boolean;
  mensagem: string;
  usuario?: Usuario;
}

@Component({
  selector: 'app-cadastro',
  standalone: false,
  styleUrl: './cadastro.componente.scss',
  templateUrl: './cadastro.componente.html',
})
export class CadastroComponente {
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmacaoSenha: string = '';
  cadastroConcluido: boolean = false;

  private usuarios: ContaFicticia[] = [
    {
      id: '1',
      nome: 'Usuario Demo',
      email: 'demo@geekhub.example',
      senha: 'demo',
    },
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  cadastrar(): void {
    if (this.cadastroConcluido) {
      return;
    }

    const request: CadastroRequest = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      confirmacaoSenha: this.confirmacaoSenha,
    };

    const resultado = this.cadastrarUsuario(request);

    this.snackBar.open(resultado.mensagem, 'Fechar', {
      duration: 4000,
    });

    if (resultado.sucesso) {
      this.cadastroConcluido = true;
      void this.router.navigate(['/entrar']);
    }
  }

  cadastrarUsuario(request: CadastroRequest): CadastroResultado {
    const usuario: Usuario = {
      id: crypto.randomUUID(),
      nome: request.nome.trim(),
      email: request.email.trim().toLowerCase(),
    };

    this.usuarios.push({
      ...usuario,
      senha: request.senha,
    });

    return {
      sucesso: true,
      mensagem: 'Conta criada com sucesso!',
      usuario: usuario,
    };
  }
}