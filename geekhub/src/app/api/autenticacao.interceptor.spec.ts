import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { URL_API } from './configuracao-api';
import { SessaoApi } from './sessao-api';

describe('autenticacaoInterceptor', () => {
  const url = 'http://api.teste';
  let http: HttpClient;
  let controlador: HttpTestingController;
  let sessao: SessaoApi;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([autenticacaoInterceptor])),
        provideHttpClientTesting(),
        { provide: URL_API, useValue: url },
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
    sessao = TestBed.inject(SessaoApi);
  });

  afterEach(() => {
    controlador.verify();
    localStorage.clear();
  });

  it('envia o token apenas para a API', () => {
    sessao.iniciar({ accessToken: 'abc', expiresIn: 3600 });

    http.get(`${url}/carrinho`).subscribe();
    http.get('https://outro.site/dados').subscribe();

    expect(controlador.expectOne(`${url}/carrinho`).request.headers.get('Authorization')).toBe('Bearer abc');
    expect(controlador.expectOne('https://outro.site/dados').request.headers.has('Authorization')).toBe(false);
  });

  it('nao envia token quando nao ha sessao', () => {
    http.get(`${url}/anuncios`).subscribe();
    expect(controlador.expectOne(`${url}/anuncios`).request.headers.has('Authorization')).toBe(false);
  });

  it('descarta a sessao quando a API responde 401', () => {
    let expirou = false;
    sessao.sessaoExpirada.subscribe(() => (expirou = true));
    sessao.iniciar({ accessToken: 'abc', expiresIn: 3600 });

    http.get(`${url}/carrinho`).subscribe({ error: () => undefined });
    controlador.expectOne(`${url}/carrinho`).flush({ erro: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });

    expect(sessao.autenticado).toBe(false);
    expect(expirou).toBe(true);
  });
});
