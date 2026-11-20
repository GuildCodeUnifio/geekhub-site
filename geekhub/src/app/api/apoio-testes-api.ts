// Apoio para testes da integração com a API (não é incluído no bundle da aplicação).
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from '../app';
import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { FONTE_DADOS, URL_API } from './configuracao-api';
import { SessaoApi } from './sessao-api';

export const URL_TESTE = 'http://api.teste';

export function criarToken(claims: object): string {
  const codificar = (valor: object) =>
    btoa(JSON.stringify(valor)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${codificar({ alg: 'RS256' })}.${codificar(claims)}.assinatura`;
}

export function configurarModoApi(): { app: App; http: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(withInterceptors([autenticacaoInterceptor])),
      provideHttpClientTesting(),
      { provide: FONTE_DADOS, useValue: 'api' },
      { provide: URL_API, useValue: URL_TESTE },
      App,
    ],
  });

  return { app: TestBed.inject(App), http: TestBed.inject(HttpTestingController) };
}

export function autenticar(): void {
  TestBed.inject(SessaoApi).iniciar({
    accessToken: criarToken({ sub: 'Usuario GeekHub', email: 'usuario@geekhub.com' }),
    expiresIn: 3600,
  });
}
