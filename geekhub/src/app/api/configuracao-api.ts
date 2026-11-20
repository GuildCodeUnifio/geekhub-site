import { InjectionToken } from '@angular/core';

/**
 * De onde o frontend busca os dados:
 * - `api`: consome o geekhub-api (requer a API em execução em `urlBase`);
 * - `mock`: usa os dados de exemplo mantidos pelo `App` no localStorage.
 */
export type FonteDados = 'api' | 'mock';

export const CONFIGURACAO_API: { readonly urlBase: string; readonly fonteDados: FonteDados } = {
  urlBase: 'http://localhost:8080',
  fonteDados: 'api',
};

export const URL_API = new InjectionToken<string>('URL_API', {
  providedIn: 'root',
  factory: () => CONFIGURACAO_API.urlBase,
});

/** Padrão `mock` para testes; o `AppModule` fornece `CONFIGURACAO_API.fonteDados`. */
export const FONTE_DADOS = new InjectionToken<FonteDados>('FONTE_DADOS', {
  providedIn: 'root',
  factory: () => 'mock',
});
