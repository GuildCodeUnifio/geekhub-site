import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { App, type CategoriaDetalheResponse } from '../../app';

@Component({
  selector: 'app-gerenciar-categorias',
  standalone: false,
  templateUrl: './gerenciar-categorias.componente.html',
  styleUrl: './gerenciar-categorias.componente.scss',
})
export class GerenciarCategoriasComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  categorias: CategoriaDetalheResponse[] = [];
  emEdicaoId: number | null = null;
  nome = '';
  descricao = '';
  ativa = true;

  carregando = false;
  salvando = false;
  confirmandoExclusaoId: number | null = null;
  removendoId: number | null = null;
  erro = '';
  mensagem = '';

  private consultaAtual?: Subscription;

  get ehAdmin(): boolean {
    return this.app.usuarioAtualEhAdmin;
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());

    if (!this.app.usuarioAtual) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/categorias' },
      });
      return;
    }

    this.carregar();
  }

  carregar(): void {
    this.consultaAtual?.unsubscribe();
    this.carregando = true;
    this.erro = '';

    this.consultaAtual = this.app.dados.listarTodasCategorias().subscribe({
      next: categorias => {
        this.categorias = categorias;
        this.carregando = false;
        this.detector.markForCheck();
      },
      error: (erro: Error) => {
        this.carregando = false;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }

  editar(categoria: CategoriaDetalheResponse): void {
    this.emEdicaoId = categoria.identificador;
    this.nome = categoria.nome;
    this.descricao = categoria.descricao;
    this.ativa = categoria.ativa;
    this.erro = '';
    this.mensagem = '';
  }

  cancelarEdicao(): void {
    this.emEdicaoId = null;
    this.nome = '';
    this.descricao = '';
    this.ativa = true;
  }

  salvar(): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || !this.ehAdmin || this.salvando) {
      return;
    }

    if (!this.nome.trim()) {
      this.erro = 'Informe o nome da categoria.';
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    const payload = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim(),
      ...(this.emEdicaoId !== null ? { ativa: this.ativa } : {}),
    };

    const operacao$ =
      this.emEdicaoId !== null
        ? this.app.dados.editarCategoria(this.emEdicaoId, usuario.identificador, payload)
        : this.app.dados.cadastrarCategoria(usuario.identificador, payload);

    operacao$.subscribe({
      next: resultado => {
        this.salvando = false;
        if (!resultado.sucesso) {
          this.erro = resultado.mensagem;
          this.detector.markForCheck();
          return;
        }

        this.mensagem = resultado.mensagem;
        this.cancelarEdicao();
        this.carregar();
      },
      error: (erro: Error) => {
        this.salvando = false;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }

  solicitarExclusao(identificador: number): void {
    this.confirmandoExclusaoId = identificador;
    this.erro = '';
    this.mensagem = '';
  }

  cancelarExclusao(): void {
    this.confirmandoExclusaoId = null;
  }

  confirmarExclusao(identificador: number): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || !this.ehAdmin || this.removendoId !== null) {
      return;
    }

    this.removendoId = identificador;
    this.erro = '';
    this.mensagem = '';

    this.app.dados.removerCategoria(identificador, usuario.identificador).subscribe({
      next: resultado => {
        this.removendoId = null;
        this.confirmandoExclusaoId = null;

        if (!resultado.sucesso) {
          this.erro = resultado.mensagem;
          this.detector.markForCheck();
          return;
        }

        if (this.emEdicaoId === identificador) {
          this.cancelarEdicao();
        }
        this.mensagem = resultado.mensagem;
        this.carregar();
      },
      error: (erro: Error) => {
        this.removendoId = null;
        this.confirmandoExclusaoId = null;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }
}
