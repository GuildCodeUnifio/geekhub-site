import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';

import {
  App,
  type AnuncioResponse,
  type CategoriaResponse,
  type ConsultarAnunciosRequest,
  type ConsultarAnunciosResponse,
} from '../../app';

export type {
  AnuncioResponse,
  CategoriaResponse,
  ConsultarAnunciosRequest,
  ConsultarAnunciosResponse,
};

@Component({
  selector: 'app-catalogo',
  standalone: false,
  styleUrl: './catalogo.componente.scss',
  templateUrl: './catalogo.componente.html',
})
export class CatalogoComponente implements OnInit {
  private readonly app = inject(App);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias: CategoriaResponse[] = this.app.listarCategorias();
  readonly categoriaSelecionada = signal<number | undefined>(undefined);
  readonly termoBusca = signal('');
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = signal(8);

  readonly resultado = computed<ConsultarAnunciosResponse>(() =>
    this.consultarAnuncios({
      termo: this.termoBusca() || undefined,
      categoriaIdentificador: this.categoriaSelecionada(),
      pagina: this.paginaAtual(),
      itensPorPagina: this.itensPorPagina(),
    }),
  );

  get anuncios(): AnuncioResponse[] {
    return this.resultado().anuncios;
  }

  get totalResultados(): number {
    return this.resultado().total;
  }

  get buscaAplicada(): string {
    return this.termoBusca();
  }

  ngOnInit(): void {
    this.rota.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parametros) => {
      const novoTermo = (parametros.get('busca') ?? '').trim();
      if (novoTermo !== this.termoBusca()) {
        this.termoBusca.set(novoTermo);
        this.paginaAtual.set(1);
      }

      const categoriaParam = parametros.get('categoria');
      if (categoriaParam !== null) {
        const categoriaId = Number(categoriaParam);
        const valida = this.categorias.some((categoria) => categoria.identificador === categoriaId);
        this.categoriaSelecionada.set(valida ? categoriaId : undefined);
        this.paginaAtual.set(1);
      }
    });
  }

  consultarAnuncios(request: ConsultarAnunciosRequest = {}): ConsultarAnunciosResponse {
    return this.app.consultarAnuncios(request);
  }

  selecionarCategoria(categoriaIdentificador?: number): void {
    this.categoriaSelecionada.set(categoriaIdentificador);
    this.paginaAtual.set(1);

    if (this.rota.snapshot.queryParamMap.has('categoria')) {
      void this.roteador.navigate([], {
        relativeTo: this.rota,
        queryParams: { categoria: categoriaIdentificador ?? null },
        queryParamsHandling: 'merge',
      });
    }
  }

  aoMudarPagina(evento: PageEvent): void {
    if (evento.pageSize !== this.itensPorPagina()) {
      this.itensPorPagina.set(evento.pageSize);
    }

    this.paginaAtual.set(evento.pageIndex + 1);
  }

  limparSelecao(): void {
    const tinhaBusca = Boolean(this.termoBusca());
    const tinhaCategoriaNaRota = this.rota.snapshot.queryParamMap.has('categoria');
    this.categoriaSelecionada.set(undefined);
    this.termoBusca.set('');
    this.paginaAtual.set(1);

    if (tinhaBusca || tinhaCategoriaNaRota) {
      void this.roteador.navigate([], {
        relativeTo: this.rota,
        queryParams: { busca: null, categoria: null },
        queryParamsHandling: 'merge',
      });
    }
  }
}
