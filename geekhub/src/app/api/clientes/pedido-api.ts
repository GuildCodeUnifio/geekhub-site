import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type {
  AtualizarEstadoPedidoRequest,
  AtualizarEstadoPedidoResponse,
  CriarPedidoResponse,
  DetalharPedidoResponse,
  EstadoPedido,
  ListarCompraResponse,
  ListarPedidoAdminResponse,
  ListarVendaResponse,
  Pagina,
  PaginaSpring,
  Paginacao,
} from '../modelos-api';
import { montarParametros, normalizarPagina } from '../utilitarios-api';

@Injectable({ providedIn: 'root' })
export class PedidoApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** POST /pedidos — cria o pedido a partir do carrinho do usuário autenticado. */
  criar(): Observable<CriarPedidoResponse> {
    return this.http.post<CriarPedidoResponse>(`${this.urlApi}/pedidos`, null);
  }

  /** GET /pedidos/compras */
  listarCompras(
    filtro: { estado?: EstadoPedido } = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarCompraResponse>> {
    return this.http
      .get<PaginaSpring<ListarCompraResponse>>(`${this.urlApi}/pedidos/compras`, {
        params: montarParametros(filtro, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /pedidos/vendas */
  listarVendas(
    filtro: { estado?: EstadoPedido } = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarVendaResponse>> {
    return this.http
      .get<PaginaSpring<ListarVendaResponse>>(`${this.urlApi}/pedidos/vendas`, {
        params: montarParametros(filtro, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /pedidos (admin) */
  listarTodos(
    filtro: { estado?: EstadoPedido } = {},
    paginacao: Paginacao = {},
  ): Observable<Pagina<ListarPedidoAdminResponse>> {
    return this.http
      .get<PaginaSpring<ListarPedidoAdminResponse>>(`${this.urlApi}/pedidos`, {
        params: montarParametros(filtro, paginacao),
      })
      .pipe(map(pagina => normalizarPagina(pagina)));
  }

  /** GET /pedidos/{id} */
  detalhar(id: number): Observable<DetalharPedidoResponse> {
    return this.http.get<DetalharPedidoResponse>(`${this.urlApi}/pedidos/${id}`);
  }

  /** PUT /pedidos/{id} */
  atualizarEstado(
    id: number,
    request: AtualizarEstadoPedidoRequest,
  ): Observable<AtualizarEstadoPedidoResponse> {
    return this.http.put<AtualizarEstadoPedidoResponse>(`${this.urlApi}/pedidos/${id}`, request);
  }

  /** DELETE /pedidos/{id} */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/pedidos/${id}`);
  }
}
