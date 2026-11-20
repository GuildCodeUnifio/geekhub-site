import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type { LoginRequest, LoginResponse } from '../modelos-api';

@Injectable({ providedIn: 'root' })
export class AutenticacaoApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** POST /login */
  entrar(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.urlApi}/login`, request);
  }
}
