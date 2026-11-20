import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { URL_API } from '../configuracao-api';
import type { ConsultarDashboardApiResponse } from '../modelos-api';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  /** GET /dashboard (ADMIN) */
  consultar(): Observable<ConsultarDashboardApiResponse> {
    return this.http.get<ConsultarDashboardApiResponse>(`${this.urlApi}/dashboard`);
  }
}
