import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { URL_API } from './configuracao-api';
import { SessaoApi } from './sessao-api';

/** Envia o JWT nas requisições ao geekhub-api e descarta a sessão quando o token é rejeitado. */
export const autenticacaoInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const urlApi = inject(URL_API);
  const sessao = inject(SessaoApi);

  if (!requisicao.url.startsWith(urlApi)) {
    return proximo(requisicao);
  }

  const token = sessao.token;
  const requisicaoAutenticada = token
    ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : requisicao;

  return proximo(requisicaoAutenticada).pipe(
    catchError((erro: unknown) => {
      const ehLogin = requisicao.url === `${urlApi}/login`;

      if (erro instanceof HttpErrorResponse && erro.status === 401 && token && !ehLogin) {
        sessao.expirar();
      }

      return throwError(() => erro);
    }),
  );
};
