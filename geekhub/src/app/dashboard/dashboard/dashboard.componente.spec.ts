import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { URL_TESTE, criarToken } from '../../api/apoio-testes-api';
import { autenticacaoInterceptor } from '../../api/autenticacao.interceptor';
import { FONTE_DADOS, URL_API } from '../../api/configuracao-api';
import { SessaoApi } from '../../api/sessao-api';
import { App } from '../../app';
import { DashboardModule } from '../dashboard-module';
import { DashboardComponente } from './dashboard.componente';

describe('DashboardComponente', () => {
  let app: App;
  let component: DashboardComponente;
  let fixture: ComponentFixture<DashboardComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(DashboardComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DashboardModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('calcula e exibe os quatro KPIs principais e distribuicoes a partir dos dados mockados', async () => {
    await criarComponente();

    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelectorAll('.kpi-cartao')).toHaveLength(4);
    expect(component.dados?.totalPedidos).toBe(6);
    expect(component.dados?.pedidosConcluidos).toBe(2);
    expect(component.dados?.pedidosCancelados).toBe(1);
    expect(component.dados?.taxaConclusao).toBe(33);
    expect(component.dados?.totalAnuncios).toBe(11);
    expect(component.dados?.anunciosDisponiveis).toBe(10);
    expect(component.dados?.totalCategoriasAtivas).toBe(4);
    expect(component.dados?.notaMediaAvaliacoes).toBe(5);
    expect(component.dados?.receitaTotal).toBe(2922.6);
    expect(component.dados?.pedidosRecentes).toHaveLength(5);
  });

  it('recalcula indicadores apos cadastrar anuncio e finalizar novo pedido', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    app.cadastrarAnuncio(1, {
      nome: 'Caneca Pixel',
      descricao: 'Ceramica',
      categoriaIdentificador: 4,
      preco: 100,
      estoque: 5,
      estado: 'Novo',
      conservacao: 'Excelente',
      imagens: ['https://picsum.photos/200'],
    });
    const pedido = app.criarPedido(1);
    expect(pedido.sucesso).toBe(true);

    await criarComponente();

    expect(component.dados?.totalAnuncios).toBe(12);
    expect(component.dados?.anunciosDisponiveis).toBe(11);
    expect(component.dados?.totalPedidos).toBe(7);
  });

  it('agrega indicadores pela API para admin e usa fallback automatico quando API esta offline', async () => {
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
    const http = TestBed.inject(HttpTestingController);
    autoApp.definirUsuarioAtual({ identificador: 1, nome: 'Admin', email: 'admin@geekhub.com' });
    TestBed.inject(SessaoApi).iniciar({
      accessToken: criarToken({ scope: ['ADMIN', 'USUARIO'], id: 1 }),
      expiresIn: 3600,
    });

    const chamadaOnline = firstValueFrom(autoApp.dados.carregarDashboard());
    http.expectOne(req => req.url === `${URL_TESTE}/anuncios/admin`).flush({
      content: [
        {
          id: 1,
          nome: 'Item',
          preco: 100,
          quantidadeDisponivel: 4,
          disponivel: true,
          categoriaNome: 'Jogos',
          vendedorId: 2,
          vendedorNome: 'Luiz',
          criadoEm: '',
        },
      ],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });
    http.expectOne(req => req.url === `${URL_TESTE}/categorias`).flush({
      content: [{ id: 1, nome: 'Jogos', descricao: null, ativa: true, criadoEm: '' }],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });
    http.expectOne(req => req.url === `${URL_TESTE}/avaliacoes`).flush({
      content: [{ id: 1, pedidoId: 10, vendedorId: 2, autor: { id: 1, nome: 'A', imagemPerfil: null }, nota: 4, comentario: null, criadoEm: '' }],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });
    http.expectOne(req => req.url === `${URL_TESTE}/pedidos`).flush({
      content: [
        {
          id: 10,
          compradorId: 2,
          compradorNome: 'Joao',
          compradorEmail: 'j@b.com',
          valorTotal: 150,
          estado: 'CONCLUIDO',
          avaliado: true,
          quantidadeItens: 2,
          criadoEm: '2026-11-20T12:00:00',
        },
      ],
      page: { size: 100, number: 0, totalElements: 1, totalPages: 1 },
    });

    const online = await chamadaOnline;
    expect(online.fonte).toBe('api');
    expect(online.receitaTotal).toBe(150);
    expect(online.taxaConclusao).toBe(100);
    expect(online.notaMediaAvaliacoes).toBe(4);

    const chamadaOffline = firstValueFrom(autoApp.dados.carregarDashboard());
    const reqAnuncios = http.expectOne(req => req.url === `${URL_TESTE}/anuncios/admin`);
    http.expectOne(req => req.url === `${URL_TESTE}/categorias`);
    http.expectOne(req => req.url === `${URL_TESTE}/avaliacoes`);
    http.expectOne(req => req.url === `${URL_TESTE}/pedidos`);
    reqAnuncios.error(new ProgressEvent('error'), { status: 0 });

    const offline = await chamadaOffline;
    expect(offline.fonte).toBe('mock');
    expect(offline.totalPedidos).toBe(6);
    http.verify();
  });
});
