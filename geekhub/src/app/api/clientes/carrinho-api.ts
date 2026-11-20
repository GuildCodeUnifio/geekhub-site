import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  AdicionarItemCarrinhoRequest,
  AdicionarItemCarrinhoResponse,
  ConsultarCarrinhoResponse,
  EditarItemCarrinhoRequest,
  EditarItemCarrinhoResponse,
} from '../modelos-api';

/** Carrinho do usuário autenticado (identificado pelo token). */
@Injectable({ providedIn: 'root' })
export class CarrinhoApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** GET /carrinho */
  consultar(): Observable<ConsultarCarrinhoResponse> {
    return this.http.get<ConsultarCarrinhoResponse>(`${this.urlApi}/carrinho`);
  }

  /** POST /carrinho/itens */
  adicionarItem(request: AdicionarItemCarrinhoRequest): Observable<AdicionarItemCarrinhoResponse> {
    return this.http.post<AdicionarItemCarrinhoResponse>(`${this.urlApi}/carrinho/itens`, request);
  }

  /** PUT /carrinho/itens/{id} */
  editarItem(id: number, request: EditarItemCarrinhoRequest): Observable<EditarItemCarrinhoResponse> {
    return this.http.put<EditarItemCarrinhoResponse>(`${this.urlApi}/carrinho/itens/${id}`, request);
  }

  /** DELETE /carrinho/itens/{id} */
  removerItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/carrinho/itens/${id}`);
  }

  /** DELETE /carrinho */
  limpar(): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/carrinho`);
  }
}
