import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type { ListarCategoriaResponse, Pagina, PaginaSpring, Paginacao } from '../modelos-api';
import { montarParametros, normalizarPagina } from '../utilitarios-api';

@Injectable({ providedIn: 'root' })
export class CategoriaApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** GET /categorias */
  listar(
    filtro: { ativa?: boolean } = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarCategoriaResponse>> {
    return this.http
      .get<PaginaSpring<ListarCategoriaResponse>>(`${this.urlApi}/categorias`, {
        params: montarParametros(filtro, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }
}
