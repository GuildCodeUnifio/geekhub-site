import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { URL_TESTE, criarToken } from '../../api/apoio-testes-api';
import { autenticacaoInterceptor } from '../../api/autenticacao.interceptor';
import { FONTE_DADOS, URL_API } from '../../api/configuracao-api';
import { SessaoApi } from '../../api/sessao-api';
import { App } from '../../app';
import { DashboardModule } from '../dashboard-module';
import { DashboardComponente } from './dashboard.componente';

describe('DashboardComponente', () => {
  let app: App;
  let roteador: Router;
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
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redireciona usuario nao autenticado para entrar sem carregar indicadores', async () => {
    await criarComponente();

    expect(roteador.navigate).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/dashboard' },
    });
    expect(component.dados).toBeNull();
  });

  it('bloqueia acesso com aviso restrito quando usuario comum tenta acessar', async () => {
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });

    await criarComponente();

    const elemento: HTMLElement = fixture.nativeElement;
    expect(component.ehAdmin).toBe(false);
    expect(component.dados).toBeNull();
    expect(elemento.textContent).toContain('Acesso restrito a administradores');
    expect(elemento.querySelectorAll('.kpi-cartao')).toHaveLength(0);
    await expect(firstValueFrom(app.dados.carregarDashboard())).rejects.toThrow(
      'Acesso restrito a administradores.',
    );
  });

  it('calcula e exibe os quatro KPIs principais e distribuicoes para admin no modo mock', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });

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

  it('consome GET /dashboard da API, nao faz fallback em 403 e usa fallback automatico quando API esta offline', async () => {
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
    autoApp.definirUsuarioAtual({ identificador: 99, nome: 'Admin', email: 'admin@geekhub.com' });
    TestBed.inject(SessaoApi).iniciar({
      accessToken: criarToken({ scope: ['ADMIN', 'USUARIO'], id: 99 }),
      expiresIn: 3600,
    });

    const chamadaOnline = firstValueFrom(autoApp.dados.carregarDashboard());
    http.expectOne({ method: 'GET', url: `${URL_TESTE}/dashboard` }).flush({
      receitaTotal: 150,
      ticketMedio: 150,
      totalPedidos: 1,
      pedidosConcluidos: 1,
      pedidosEmAndamento: 0,
      pedidosCancelados: 0,
      taxaConclusao: 100,
      totalAnuncios: 1,
      anunciosDisponiveis: 1,
      anunciosIndisponiveis: 0,
      unidadesEmEstoque: 4,
      totalCategoriasAtivas: 1,
      notaMediaAvaliacoes: 4,
      totalAvaliacoes: 1,
      pedidosPorEstado: [{ estado: 'CONCLUIDO', quantidade: 1, percentual: 100 }],
      anunciosPorCategoria: [
        { nome: 'Jogos', quantidadeAnuncios: 1, estoqueTotal: 4, percentual: 100 },
      ],
      pedidosRecentes: [
        {
          id: 10,
          compradorNome: 'Joao',
          estado: 'CONCLUIDO',
          valorTotal: 150,
          quantidadeItens: 2,
          criadoEm: '2026-11-20T12:00:00',
        },
      ],
    });

    const online = await chamadaOnline;
    expect(online.fonte).toBe('api');
    expect(online.receitaTotal).toBe(150);
    expect(online.taxaConclusao).toBe(100);
    expect(online.notaMediaAvaliacoes).toBe(4);
    expect(online.pedidosPorEstado[0].rotulo).toBe('Concluído');
    expect(online.pedidosRecentes[0].identificador).toBe(10);

    const chamadaProibida = firstValueFrom(autoApp.dados.carregarDashboard());
    http
      .expectOne({ method: 'GET', url: `${URL_TESTE}/dashboard` })
      .flush(
        { erro: 'Acesso negado: você não possui permissão para realizar esta operação.' },
        { status: 403, statusText: 'Forbidden' },
      );

    await expect(chamadaProibida).rejects.toThrow('Acesso negado');
    expect(autoApp.dados.usaApi).toBe(true);

    const chamadaOffline = firstValueFrom(autoApp.dados.carregarDashboard());
    http
      .expectOne({ method: 'GET', url: `${URL_TESTE}/dashboard` })
      .error(new ProgressEvent('error'), { status: 0 });

    const offline = await chamadaOffline;
    expect(offline.fonte).toBe('mock');
    expect(offline.totalPedidos).toBe(6);
    http.verify();
  });
});
