import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  DetalharAnuncioResponse,
  ListarAnuncioResponse,
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

  /** GET /anuncios/{id} */
  detalhar(id: number): Observable<DetalharAnuncioResponse> {
    return this.http.get<DetalharAnuncioResponse>(`${this.urlApi}/anuncios/${id}`);
  }
}
