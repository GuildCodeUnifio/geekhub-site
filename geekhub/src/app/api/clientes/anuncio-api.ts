import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  CadastrarAnuncioRequest,
  CadastrarAnuncioResponse,
  DetalharAnuncioResponse,
  EditarAnuncioRequest,
  EditarAnuncioResponse,
  ListarAnuncioAdminResponse,
  ListarAnuncioResponse,
  ListarMeuAnuncioResponse,
  Pagina,
  PaginaSpring,
  Paginacao,
  PesquisarAnunciosFiltro,
} from '../modelos-api';
import { montarParametros, normalizarPagina } from '../utilitarios-api';

@Injectable({ providedIn: 'root' })
export class AnuncioApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** GET /anuncios — catálogo público (apenas anúncios disponíveis). */
  pesquisar(
    filtro: PesquisarAnunciosFiltro = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarAnuncioResponse>> {
    return this.http
      .get<PaginaSpring<ListarAnuncioResponse>>(`${this.urlApi}/anuncios`, {
        params: montarParametros({ ...filtro }, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /anuncios/meus */
  listarMeus(paginacao: Paginacao = {}): Observable<Pagina<ListarMeuAnuncioResponse>> {
    return this.http
      .get<PaginaSpring<ListarMeuAnuncioResponse>>(`${this.urlApi}/anuncios/meus`, {
        params: montarParametros({}, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /anuncios/admin */
  listarAdmin(paginacao: Paginacao = {}): Observable<Pagina<ListarAnuncioAdminResponse>> {
    return this.http
      .get<PaginaSpring<ListarAnuncioAdminResponse>>(`${this.urlApi}/anuncios/admin`, {
        params: montarParametros({}, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /anuncios/{id} */
  detalhar(id: number): Observable<DetalharAnuncioResponse> {
    return this.http.get<DetalharAnuncioResponse>(`${this.urlApi}/anuncios/${id}`);
  }

  /** POST /anuncios */
  cadastrar(request: CadastrarAnuncioRequest): Observable<CadastrarAnuncioResponse> {
    return this.http.post<CadastrarAnuncioResponse>(`${this.urlApi}/anuncios`, request);
  }

  /** PUT /anuncios/{id} */
  editar(id: number, request: EditarAnuncioRequest): Observable<EditarAnuncioResponse> {
    return this.http.put<EditarAnuncioResponse>(`${this.urlApi}/anuncios/${id}`, request);
  }

  /** DELETE /anuncios/{id} */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/anuncios/${id}`);
  }
}
