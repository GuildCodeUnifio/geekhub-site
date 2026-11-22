import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { App } from '../app';
import { URL_TESTE, criarToken } from './apoio-testes-api';
import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { FONTE_DADOS, URL_API } from './configuracao-api';
import { SessaoApi } from './sessao-api';
import { MENSAGEM_API_INDISPONIVEL } from './utilitarios-api';

function configurarModoAuto(): { app: App; http: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(withInterceptors([autenticacaoInterceptor])),
      provideHttpClientTesting(),
      { provide: FONTE_DADOS, useValue: 'auto' },
      { provide: URL_API, useValue: URL_TESTE },
      App,
    ],
  });

  return { app: TestBed.inject(App), http: TestBed.inject(HttpTestingController) };
}

describe('DadosGeekhub — modo automatico (API -> fallback mock)', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoAuto());
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('usa a API normalmente quando ela responde', async () => {
    expect(app.dados.usaApi).toBe(true);
    expect(app.dados.usandoFallbackMock).toBe(false);

    const resposta = firstValueFrom(app.dados.listarCategorias());
    http
      .expectOne(req => req.url === `${URL_TESTE}/categorias`)
      .flush({ content: [{ id: 10, nome: 'Consoles', descricao: null, ativa: true, criadoEm: '' }] });

    expect(await resposta).toEqual([{ identificador: 10, nome: 'Consoles' }]);
    expect(app.dados.usaApi).toBe(true);
    expect(app.dados.usandoFallbackMock).toBe(false);
  });

  it('alterna automaticamente para o mock quando a API esta inacessivel (status 0) e mantem nas chamadas seguintes', async () => {
    const anuncios = firstValueFrom(app.dados.consultarAnuncios());
    http
      .expectOne(req => req.url === `${URL_TESTE}/anuncios`)
      .error(new ProgressEvent('error'), { status: 0 });

    const pagina = await anuncios;
    expect(pagina.total).toBeGreaterThan(0);
    expect(app.dados.usaApi).toBe(false);
    expect(app.dados.usandoFallbackMock).toBe(true);

    const categorias = await firstValueFrom(app.dados.listarCategorias());
    expect(categorias.length).toBeGreaterThan(0);
    http.expectNone(req => req.url.startsWith(URL_TESTE));
  });

  it('faz fallback no login e mantem a sessao mock ativa em recarregamentos offline, limpando se a API voltar', async () => {
    const usuarioOffline = firstValueFrom(app.dados.entrar({ email: 'demo@geekhub.com', senha: '123456' }));
    http.expectOne(`${URL_TESTE}/login`).error(new ProgressEvent('error'), { status: 0 });

    const logado = await usuarioOffline;
    expect(logado?.email).toBe('demo@geekhub.com');
    expect(app.dados.usandoFallbackMock).toBe(true);
    expect(app.usuarioAtualEhAdmin).toBe(true);

    TestBed.resetTestingModule();
    ({ app, http } = configurarModoAuto());
    expect(app.usuarioAtual?.email).toBe('demo@geekhub.com');

    const catalogoOnline = firstValueFrom(app.dados.listarCategorias());
    http.expectOne(req => req.url === `${URL_TESTE}/categorias`).flush({ content: [] });
    await catalogoOnline;

    expect(app.usuarioAtual).toBeNull();
  });

  it('faz fallback automatico em carrinho, limpeza, pedidos, avaliacao e edicao de perfil quando API esta offline', async () => {
    const carrinho = firstValueFrom(app.dados.consultarCarrinho(1));
    http.expectOne(`${URL_TESTE}/carrinho`).error(new ProgressEvent('error'), { status: 0 });
    expect((await carrinho).itens.length).toBeGreaterThan(0);
    expect(app.dados.usandoFallbackMock).toBe(true);

    const limpo = await firstValueFrom(app.dados.limparCarrinho(1));
    expect(limpo.sucesso).toBe(true);
    expect(limpo.carrinho.itens).toEqual([]);

    const adicionado = await firstValueFrom(
      app.dados.adicionarAoCarrinho({ compradorIdentificador: 1, anuncioIdentificador: 1, quantidade: 1 }),
    );
    expect(adicionado.sucesso).toBe(true);

    const compras = await firstValueFrom(app.dados.listarCompras({ compradorIdentificador: 1 }));
    expect(compras.total).toBeGreaterThan(0);

    const perfil = await firstValueFrom(
      app.dados.editarPerfil({ usuarioIdentificador: 2, nome: 'Usuario Teste Editado', email: 'teste@geekhub.com' }),
    );
    expect(perfil.sucesso).toBe(true);

    const pedido = await firstValueFrom(app.dados.criarPedido(1));
    expect(pedido.sucesso).toBe(true);
    expect(pedido.pedido?.estado).toBe('CRIADO');

    const detalhe = await firstValueFrom(app.dados.detalharPedido(1, 1003));
    expect(detalhe?.identificador).toBe(1003);

    const avaliado = await firstValueFrom(
      app.dados.avaliarPedido({ compradorIdentificador: 1, pedidoIdentificador: 1003, nota: 5, comentario: 'Excelente' }),
    );
    expect(avaliado.sucesso).toBe(true);
  });

  it('nao ativa fallback em erros HTTP da propria API (401, 404, 409, 400, 500)', async () => {
    const login401 = firstValueFrom(app.dados.entrar({ email: 'a@b.com', senha: 'errada' }));
    http.expectOne(`${URL_TESTE}/login`).flush({ erro: 'Credenciais invalidas' }, { status: 401, statusText: 'Unauthorized' });
    expect(await login401).toBeNull();
    expect(app.dados.usaApi).toBe(true);

    const anuncio404 = firstValueFrom(app.dados.buscarAnuncio(999));
    http.expectOne(`${URL_TESTE}/anuncios/999`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(await anuncio404).toBeNull();
    expect(app.dados.usaApi).toBe(true);

    const cadastro409 = firstValueFrom(app.dados.cadastrar({ nome: 'A', email: 'a@b.com', senha: '123' }));
    http.expectOne(`${URL_TESTE}/usuarios`).flush({}, { status: 409, statusText: 'Conflict' });
    expect(await cadastro409).toBeNull();
    expect(app.dados.usaApi).toBe(true);

    const carrinho400 = firstValueFrom(app.dados.adicionarAoCarrinho({ compradorIdentificador: 1, anuncioIdentificador: 1, quantidade: 99 }));
    http.expectOne(`${URL_TESTE}/carrinho/itens`).flush({ erro: 'Estoque insuficiente' }, { status: 400, statusText: 'Bad Request' });
    http.expectOne(`${URL_TESTE}/carrinho`).flush({ compradorId: 1, itens: [], total: 0 });
    expect(await carrinho400).toMatchObject({ sucesso: false, mensagem: 'Estoque insuficiente' });
    expect(app.dados.usaApi).toBe(true);

    const erro500 = firstValueFrom(app.dados.listarCategorias());
    http.expectOne(req => req.url === `${URL_TESTE}/categorias`).flush({ erro: 'Erro interno' }, { status: 500, statusText: 'Server Error' });
    await expect(erro500).rejects.toThrow('Erro interno');
    expect(app.dados.usaApi).toBe(true);
  });

  it('identifica corretamente permissao admin via JWT e no modo mock', () => {
    const sessao = TestBed.inject(SessaoApi);

    app.definirUsuarioAtual({ identificador: 1, nome: 'Admin', email: 'demo@geekhub.com' });
    sessao.iniciar({ accessToken: criarToken({ scope: ['USUARIO', 'ADMIN'] }), expiresIn: 3600 });
    expect(sessao.ehAdmin).toBe(true);
    expect(app.usuarioAtualEhAdmin).toBe(true);

    sessao.iniciar({ accessToken: criarToken({ scope: 'USUARIO SCOPE_ADMIN' }), expiresIn: 3600 });
    expect(sessao.ehAdmin).toBe(true);

    sessao.iniciar({ accessToken: criarToken({ scope: 'USUARIO' }), expiresIn: 3600 });
    expect(sessao.ehAdmin).toBe(false);
    expect(app.usuarioAtualEhAdmin).toBe(false);

    sessao.limpar();
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });
    expect(app.usuarioAtualEhAdmin).toBe(false);
  });

  it('preserva o erro de API indisponivel quando a fonte esta fixada em api', async () => {
    TestBed.resetTestingModule();
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
    const estritoApp = TestBed.inject(App);
    const estritoHttp = TestBed.inject(HttpTestingController);

    const chamada = firstValueFrom(estritoApp.dados.listarCategorias());
    estritoHttp.expectOne(req => req.url === `${URL_TESTE}/categorias`).error(new ProgressEvent('error'), { status: 0 });
    await expect(chamada).rejects.toThrow(MENSAGEM_API_INDISPONIVEL);
    estritoHttp.verify();
  });

  it('alterna para o mock durante cold start (502/503/504 ou timeout de 6s) e aceita login admin@geekhub.com no mock', async () => {
    vi.useFakeTimers();
    try {
      const chamadaTimeout = firstValueFrom(app.dados.consultarAnuncios());
      http.expectOne(req => req.url === `${URL_TESTE}/anuncios`);
      await vi.advanceTimersByTimeAsync(6000);

      const resultadoTimeout = await chamadaTimeout;
      expect(resultadoTimeout.total).toBeGreaterThan(0);
      expect(app.dados.usandoFallbackMock).toBe(true);
    } finally {
      vi.useRealTimers();
    }

    TestBed.resetTestingModule();
    ({ app, http } = configurarModoAuto());

    const login503 = firstValueFrom(app.dados.entrar({ email: 'admin@geekhub.com', senha: '123456' }));
    http
      .expectOne(`${URL_TESTE}/login`)
      .flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });

    const admin = await login503;
    expect(admin?.email).toBe('demo@geekhub.com');
    expect(app.usuarioAtualEhAdmin).toBe(true);
    expect(app.dados.usandoFallbackMock).toBe(true);
  });
});
