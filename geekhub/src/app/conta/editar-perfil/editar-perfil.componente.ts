import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { App } from '../../app';

type CampoPerfil = 'nome' | 'email' | 'foto';

@Component({
  selector: 'app-editar-perfil',
  standalone: false,
  styleUrl: './editar-perfil.componente.scss',
  templateUrl: './editar-perfil.componente.html',
})
export class EditarPerfilComponente implements OnInit {
  private readonly app = inject(App);
  private readonly roteador = inject(Router);

  nome = '';
  email = '';
  foto = '';
  editandoFoto = false;
  fotoComErro = false;
  errosCampos: Partial<Record<CampoPerfil, string>> = {};
  mensagemSucesso = '';
  mensagemErro = '';

  ngOnInit(): void {
    const usuario = this.app.usuarioAtual;

    if (!usuario) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/minha-conta/perfil' },
      });
      return;
    }

    this.nome = usuario.nome;
    this.email = usuario.email;
    this.foto = usuario.foto ?? '';
  }

  get iniciais(): string {
    return this.nome.trim().charAt(0).toUpperCase() || '?';
  }

  alternarEdicaoFoto(): void {
    this.editandoFoto = !this.editandoFoto;
  }

  aoAlterarFoto(): void {
    this.fotoComErro = false;
    this.limparErroCampo('foto');
  }

  limparErroCampo(campo: CampoPerfil): void {
    delete this.errosCampos[campo];
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  validar(): boolean {
    const erros: Partial<Record<CampoPerfil, string>> = {};
    const email = this.email.trim();
    const foto = this.foto.trim();

    if (!this.nome.trim()) {
      erros.nome = 'Informe seu nome.';
    }

    if (!email) {
      erros.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erros.email = 'Informe um e-mail válido.';
    }

    if (foto && !/^https?:\/\/\S+$/i.test(foto)) {
      erros.foto = 'Informe um endereço de imagem iniciado por http:// ou https://.';
    }

    this.errosCampos = erros;
    return Object.keys(erros).length === 0;
  }

  salvar(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const usuario = this.app.usuarioAtual;
    if (!usuario) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/minha-conta/perfil' },
      });
      return;
    }

    if (!this.validar()) {
      return;
    }

    const resultado = this.app.editarPerfil({
      usuarioIdentificador: usuario.identificador,
      nome: this.nome,
      email: this.email,
      foto: this.foto,
    });

    if (!resultado.sucesso || !resultado.usuario) {
      this.mensagemErro = resultado.mensagem;
      return;
    }

    this.nome = resultado.usuario.nome;
    this.email = resultado.usuario.email;
    this.foto = resultado.usuario.foto ?? '';
    this.editandoFoto = false;
    this.mensagemSucesso = resultado.mensagem;
  }

  sair(): void {
    this.app.sair();
  }
}
