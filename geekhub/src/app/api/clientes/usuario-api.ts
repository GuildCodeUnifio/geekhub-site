import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  CadastrarUsuarioRequest,
  CadastrarUsuarioResponse,
  DetalharUsuarioResponse,
  EditarUsuarioRequest,
  EditarUsuarioResponse,
  PerfilVendedorResponse,
} from '../modelos-api';

@Injectable({ providedIn: 'root' })
export class UsuarioApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** POST /usuarios */
  cadastrar(request: CadastrarUsuarioRequest): Observable<CadastrarUsuarioResponse> {
    return this.http.post<CadastrarUsuarioResponse>(`${this.urlApi}/usuarios`, request);
  }

  /** GET /usuarios/{id} */
  detalhar(id: number): Observable<DetalharUsuarioResponse> {
    return this.http.get<DetalharUsuarioResponse>(`${this.urlApi}/usuarios/${id}`);
  }

  /** PUT /usuarios/{id} */
  editar(id: number, request: EditarUsuarioRequest): Observable<EditarUsuarioResponse> {
    return this.http.put<EditarUsuarioResponse>(`${this.urlApi}/usuarios/${id}`, request);
  }

  /** GET /usuarios/{id}/perfil-vendedor */
  perfilVendedor(id: number): Observable<PerfilVendedorResponse> {
    return this.http.get<PerfilVendedorResponse>(`${this.urlApi}/usuarios/${id}/perfil-vendedor`);
  }
}
