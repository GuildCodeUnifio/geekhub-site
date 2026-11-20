import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  CadastrarAvaliacaoRequest,
  CadastrarAvaliacaoResponse,
  ListarAvaliacaoResponse,
  Pagina,
  PaginaSpring,
  Paginacao,
} from '../modelos-api';
import { montarParametros, normalizarPagina } from '../utilitarios-api';

@Injectable({ providedIn: 'root' })
export class AvaliacaoApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** POST /avaliacoes */
  cadastrar(request: CadastrarAvaliacaoRequest): Observable<CadastrarAvaliacaoResponse> {
    return this.http.post<CadastrarAvaliacaoResponse>(`${this.urlApi}/avaliacoes`, request);
  }

  /** GET /avaliacoes */
  listar(
    filtro: { vendedorId?: number } = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarAvaliacaoResponse>> {
    return this.http
      .get<PaginaSpring<ListarAvaliacaoResponse>>(`${this.urlApi}/avaliacoes`, {
        params: montarParametros(filtro, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }
}
