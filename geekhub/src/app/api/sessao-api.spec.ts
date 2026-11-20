import { TestBed } from '@angular/core/testing';

import { SessaoApi, decodificarToken } from './sessao-api';

function criarToken(claims: object): string {
  const codificar = (valor: object) =>
    btoa(JSON.stringify(valor)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${codificar({ alg: 'RS256' })}.${codificar(claims)}.assinatura`;
}

describe('SessaoApi', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('persiste o token e expira apos o prazo', () => {
    const sessao = TestBed.inject(SessaoApi);
    sessao.iniciar({ accessToken: 'abc', expiresIn: 3600 });

    expect(sessao.token).toBe('abc');
    expect(JSON.parse(localStorage.getItem('geekhub.sessaoApi') ?? '{}').accessToken).toBe('abc');

    sessao.iniciar({ accessToken: 'velho', expiresIn: -1 });
    expect(sessao.token).toBeNull();
    expect(localStorage.getItem('geekhub.sessaoApi')).toBeNull();
  });

  it('decodifica as claims do JWT, incluindo acentos', () => {
    const token = criarToken({ sub: 'Usuario', email: 'usuario@geekhub.com', scope: ['USUARIO'] });
    expect(decodificarToken(token)).toEqual({
      sub: 'Usuario',
      email: 'usuario@geekhub.com',
      scope: ['USUARIO'],
    });
    expect(decodificarToken('invalido')).toBeNull();
  });
});
