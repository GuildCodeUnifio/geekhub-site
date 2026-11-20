import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { App } from '../app';
import { URL_TESTE, autenticar, configurarModoApi, criarToken } from './apoio-testes-api';
import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { FONTE_DADOS, URL_API } from './configuracao-api';
import { SessaoApi } from './sessao-api';

describe('DadosGeekhub — CRUD de anuncios', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoApi());
    autenticar();
    app.definirUsuarioAtual({ identificador: 1, nome: 'Usuario GeekHub', email: 'demo@geekhub.com' });
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('lista meus anuncios e visao admin pela API', async () => {
    const meus = firstValueFrom(app.dados.listarMeusAnuncios(1, 2, 8, false));
    const reqMeus = http.expectOne(req => req.url === `${URL_TESTE}/anuncios/meus`);
    expect(reqMeus.request.params.get('page')).toBe('1');
    reqMeus.flush({
      content: [
        {
          id: 21,
          nome: 'Action Figure Luffy',
          preco: 350,
          quantidadeDisponivel: 2,
          disponivel: true,
          condicao: 'NOVO',
          conservacao: 'EXCELENTE',
          categoriaNome: 'Figuras colecionáveis',
          imagemPrincipal: 'https://picsum.photos/200',
          criadoEm: '2026-11-20T10:00:00',
        },
      ],
      page: { size: 8, number: 1, totalElements: 9, totalPages: 2 },
    });
    expect((await meus).anuncios[0]).toMatchObject({ identificador: 21, nome: 'Action Figure Luffy', estado: 'Novo' });

    TestBed.inject(SessaoApi).iniciar({
      accessToken: criarToken({ scope: ['ADMIN'] }),
      expiresIn: 3600,
    });
    const admin = firstValueFrom(app.dados.listarMeusAnuncios(1, 1, 8, true));
    http.expectOne(req => req.url === `${URL_TESTE}/anuncios/admin`).flush({
      content: [
        {
          id: 22,
          nome: 'Teclado Mecanico',
          preco: 420,
          quantidadeDisponivel: 5,
          disponivel: true,
          categoriaNome: 'Acessórios',
          vendedorId: 3,
          vendedorNome: 'Marina',
          criadoEm: '2026-11-20T10:00:00',
        },
      ],
    });
    expect((await admin).anuncios[0]).toMatchObject({ identificador: 22, vendedorNome: 'Marina' });
  });

  it('cadastra, edita e remove anuncio pela API', async () => {
    const cadastro = firstValueFrom(
      app.dados.cadastrarAnuncio(1, {
        nome: 'Poster',
        descricao: 'A3',
        categoriaIdentificador: 4,
        preco: 40,
        estoque: 3,
        estado: 'Novo',
        conservacao: 'Excelente',
        imagens: ['https://picsum.photos/200'],
      }),
    );

    const post = http.expectOne({ method: 'POST', url: `${URL_TESTE}/anuncios` });
    expect(post.request.body).toMatchObject({
      nome: 'Poster',
      categoriaId: 4,
      condicao: 'NOVO',
      conservacao: 'EXCELENTE',
    });
    post.flush({
      id: 30,
      nome: 'Poster',
      descricao: 'A3',
      categoriaId: 4,
      categoriaNome: 'Acessórios',
      preco: 40,
      quantidadeDisponivel: 3,
      disponivel: true,
      condicao: 'NOVO',
      conservacao: 'EXCELENTE',
      imagens: ['https://picsum.photos/200'],
      criadoEm: '2026-11-20T10:00:00',
    });
    expect((await cadastro).sucesso).toBe(true);

    const edicao = firstValueFrom(
      app.dados.editarAnuncio(30, 1, {
        nome: 'Poster Editado',
        descricao: 'A3',
        categoriaIdentificador: 4,
        preco: 45,
        estoque: 2,
        disponivel: false,
        estado: 'Usado',
        conservacao: 'Bom',
        imagens: ['https://picsum.photos/200'],
      }),
    );
    const put = http.expectOne({ method: 'PUT', url: `${URL_TESTE}/anuncios/30` });
    expect(put.request.body).toMatchObject({
      disponivel: false,
      condicao: 'USADO',
      conservacao: 'BOM',
    });
    put.flush({
      id: 30,
      nome: 'Poster Editado',
      descricao: 'A3',
      categoriaId: 4,
      categoriaNome: 'Acessórios',
      preco: 45,
      quantidadeDisponivel: 2,
      disponivel: false,
      condicao: 'USADO',
      conservacao: 'BOM',
      imagens: ['https://picsum.photos/200'],
      criadoEm: '2026-11-20T10:00:00',
    });
    expect((await edicao).anuncio?.disponivel).toBe(false);

    const remocao = firstValueFrom(app.dados.removerAnuncio(30, 1));
    http.expectOne({ method: 'DELETE', url: `${URL_TESTE}/anuncios/30` }).flush(null);
    expect((await remocao).sucesso).toBe(true);
  });

  it('usa fallback automatico no cadastro de anuncio quando a API estiver offline', async () => {
    TestBed.resetTestingModule();
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

    const autoApp = TestBed.inject(App);
    const autoHttp = TestBed.inject(HttpTestingController);
    autoApp.definirUsuarioAtual({ identificador: 1, nome: 'Usuario GeekHub', email: 'demo@geekhub.com' });

    const chamada = firstValueFrom(
      autoApp.dados.cadastrarAnuncio(1, {
        nome: 'Item Offline',
        descricao: 'Criado offline',
        categoriaIdentificador: 1,
        preco: 120,
        estoque: 2,
        estado: 'Novo',
        conservacao: 'Excelente',
        imagens: ['https://picsum.photos/350'],
      }),
    );

    autoHttp.expectOne(`${URL_TESTE}/anuncios`).error(new ProgressEvent('error'), { status: 0 });
    const resultado = await chamada;
    expect(resultado.sucesso).toBe(true);
    expect(autoApp.dados.usandoFallbackMock).toBe(true);
    autoHttp.verify();
  });
});
