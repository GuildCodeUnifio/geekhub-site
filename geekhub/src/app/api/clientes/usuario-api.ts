import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  AtualizarPermissaoUsuarioRequest,
  AtualizarPermissaoUsuarioResponse,
  CadastrarUsuarioRequest,
  CadastrarUsuarioResponse,
  DetalharUsuarioResponse,
  EditarUsuarioRequest,
  EditarUsuarioResponse,
  ListarUsuarioResponse,
  Pagina,
  PaginaSpring,
  Paginacao,
  PerfilVendedorResponse,
} from '../modelos-api';
import { montarParametros, normalizarPagina } from '../utilitarios-api';

@Injectable({ providedIn: 'root' })
export class UsuarioApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** POST /usuarios */
  cadastrar(request: CadastrarUsuarioRequest): Observable<CadastrarUsuarioResponse> {
    return this.http.post<CadastrarUsuarioResponse>(`${this.urlApi}/usuarios`, request);
  }

  /** GET /usuarios (admin) */
  listar(paginacao: Paginacao = {}): Observable<Pagina<ListarUsuarioResponse>> {
    return this.http
      .get<PaginaSpring<ListarUsuarioResponse>>(`${this.urlApi}/usuarios`, {
        params: montarParametros({}, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /usuarios/{id} */
  detalhar(id: number): Observable<DetalharUsuarioResponse> {
    return this.http.get<DetalharUsuarioResponse>(`${this.urlApi}/usuarios/${id}`);
  }

  /** PUT /usuarios/{id} */
  editar(id: number, request: EditarUsuarioRequest): Observable<EditarUsuarioResponse> {
    return this.http.put<EditarUsuarioResponse>(`${this.urlApi}/usuarios/${id}`, request);
  }

  /** PUT /usuarios/{id}/permissao (admin) */
  atualizarPermissao(
    id: number,
    request: AtualizarPermissaoUsuarioRequest,
  ): Observable<AtualizarPermissaoUsuarioResponse> {
    return this.http.put<AtualizarPermissaoUsuarioResponse>(
      `${this.urlApi}/usuarios/${id}/permissao`,
      request,
    );
  }

  /** DELETE /usuarios/{id} (admin) */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/usuarios/${id}`);
  }

  /** GET /usuarios/{id}/perfil-vendedor */
  perfilVendedor(id: number): Observable<PerfilVendedorResponse> {
    return this.http.get<PerfilVendedorResponse>(`${this.urlApi}/usuarios/${id}/perfil-vendedor`);
  }
}
