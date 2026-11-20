import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import type { App } from '../app';
import { URL_TESTE, autenticar, configurarModoApi, criarToken } from './apoio-testes-api';
import { SessaoApi } from './sessao-api';
import { MENSAGEM_API_INDISPONIVEL } from './utilitarios-api';

describe('DadosGeekhub — autenticacao pela API', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoApi());
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('entra, identifica o usuario pelo carrinho e preenche a sessao', async () => {
    const resposta = firstValueFrom(app.dados.entrar({ email: ' USUARIO@geekhub.com ', senha: '123456' }));

    const login = http.expectOne(`${URL_TESTE}/login`);
    expect(login.request.body).toEqual({ email: 'usuario@geekhub.com', senha: '123456' });
    login.flush({
      accessToken: criarToken({ sub: 'Usuario GeekHub', email: 'usuario@geekhub.com' }),
      expiresIn: 3600,
    });

    const carrinho = http.expectOne(`${URL_TESTE}/carrinho`);
    expect(carrinho.request.headers.get('Authorization')).toMatch(/^Bearer /);
    carrinho.flush({ compradorId: 2, itens: [], total: 0 });

    http.expectOne(`${URL_TESTE}/usuarios/2`).flush({
      id: 2,
      nome: 'Usuario GeekHub',
      email: 'usuario@geekhub.com',
      imagemPerfil: 'https://picsum.photos/200',
      ativo: true,
      criadoEm: '2026-11-13T18:00:00',
    });

    const usuario = await resposta;
    expect(usuario).toEqual({
      identificador: 2,
      nome: 'Usuario GeekHub',
      email: 'usuario@geekhub.com',
      foto: 'https://picsum.photos/200',
    });
    expect(app.usuarioAtual).toEqual(usuario);
    expect(TestBed.inject(SessaoApi).autenticado).toBe(true);
  });

  it('usa a claim id do token quando ela existir', async () => {
    const resposta = firstValueFrom(app.dados.entrar({ email: 'a@b.com', senha: '123456' }));

    http.expectOne(`${URL_TESTE}/login`).flush({
      accessToken: criarToken({ sub: 'A', email: 'a@b.com', id: 7 }),
      expiresIn: 3600,
    });
    http.expectOne(`${URL_TESTE}/usuarios/7`).flush({ id: 7, nome: 'A', email: 'a@b.com', imagemPerfil: null });

    expect((await resposta)?.identificador).toBe(7);
  });

  it('retorna null para credenciais invalidas', async () => {
    const resposta = firstValueFrom(app.dados.entrar({ email: 'a@b.com', senha: 'errada' }));

    http
      .expectOne(`${URL_TESTE}/login`)
      .flush({ erro: 'Usuário ou senha incorretos' }, { status: 401, statusText: 'Unauthorized' });

    expect(await resposta).toBeNull();
    expect(app.usuarioAtual).toBeNull();
  });

  it('informa quando a API esta indisponivel', async () => {
    const resposta = firstValueFrom(app.dados.entrar({ email: 'a@b.com', senha: '123456' }));

    http.expectOne(`${URL_TESTE}/login`).error(new ProgressEvent('error'), { status: 0 });

    await expect(resposta).rejects.toThrow(MENSAGEM_API_INDISPONIVEL);
  });

  it('cadastra pela API e trata e-mail duplicado', async () => {
    const criado = firstValueFrom(app.dados.cadastrar({ nome: ' Ana ', email: 'ANA@b.com', senha: '123456' }));
    const cadastro = http.expectOne({ method: 'POST', url: `${URL_TESTE}/usuarios` });
    expect(cadastro.request.body).toEqual({ nome: 'Ana', email: 'ana@b.com', senha: '123456' });
    cadastro.flush({ id: 9, nome: 'Ana', email: 'ana@b.com', imagemPerfil: null, criadoEm: '' });
    expect(await criado).toEqual({ identificador: 9, nome: 'Ana', email: 'ana@b.com' });

    const duplicado = firstValueFrom(app.dados.cadastrar({ nome: 'Ana', email: 'ana@b.com', senha: '123456' }));
    http
      .expectOne({ method: 'POST', url: `${URL_TESTE}/usuarios` })
      .flush({ erro: 'E-mail já cadastrado' }, { status: 409, statusText: 'Conflict' });
    expect(await duplicado).toBeNull();
  });

  it('sair descarta o token e a API expirando o token encerra a sessao', () => {
    autenticar();
    app.definirUsuarioAtual({ identificador: 2, nome: 'Usuario', email: 'usuario@geekhub.com' });

    TestBed.inject(SessaoApi).expirar();
    expect(app.usuarioAtual).toBeNull();

    autenticar();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    app.sair();
    expect(TestBed.inject(SessaoApi).autenticado).toBe(false);
  });
});
