import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { App } from '../../app';
import { PedidosModule } from '../pedidos-module';
import { DetalhesPedidoComponente } from './detalhes-pedido.componente';

describe('DetalhesPedidoComponente', () => {
  let app: App;
  let roteador: Router;
  let parametros: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let component: DetalhesPedidoComponente;
  let fixture: ComponentFixture<DetalhesPedidoComponente>;

  async function criarComponente(id: string): Promise<void> {
    parametros.next(convertToParamMap({ id }));
    fixture = TestBed.createComponent(DetalhesPedidoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    parametros = new BehaviorSubject(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [PedidosModule],
      providers: [
        provideRouter([]),
        App,
        { provide: ActivatedRoute, useValue: { paramMap: parametros.asObservable() } },
      ],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redireciona para o login quando nao ha sessao', async () => {
    await criarComponente('1001');

    expect(roteador.navigate).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/pedidos/1001' },
    });
  });

  it('exibe linha do tempo, itens e resumo do pedido', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente('1004');

    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('h1')?.textContent).toContain('Pedido #1004');
    expect(component.etapas.map(etapa => etapa.ocorridoEm !== null)).toEqual([true, true, true, false]);
    expect(elemento.querySelectorAll('.item')).toHaveLength(2);
    expect(component.podeAvaliar).toBe(false);
  });

  it('mostra apenas o historico real de pedidos cancelados', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente('1002');

    expect(component.etapas.map(etapa => etapa.estado)).toEqual(['CRIADO', 'CANCELADO']);
  });

  it('informa quando o pedido nao existe ou e de outro comprador', async () => {
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });
    await criarComponente('1001');

    expect(component.erro).toBe('Pedido não encontrado.');
  });

  it('avalia uma compra concluida', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente('1003');

    expect(component.podeAvaliar).toBe(true);
    component.abrirAvaliacao();
    component.enviarAvaliacao();
    expect(component.mensagemAvaliacao).toBe('Selecione uma nota de 1 a 5.');

    component.nota = 5;
    component.comentario = 'Excelente!';
    component.enviarAvaliacao();

    expect(component.avaliacaoComErro).toBe(false);
    expect(component.pedido?.avaliado).toBe(true);
    expect(component.podeAvaliar).toBe(false);
  });

  it('permite cancelar pedido em aberto com estorno de estoque e avancar estado como admin', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente('1006');

    expect(component.podeAvancarEstado).toBe(true);
    expect(component.podeCancelarPedido).toBe(true);

    component.avancarEstado();
    await fixture.whenStable();
    expect(component.pedido?.estado).toBe('CONFIRMADO');

    const estoqueAntes = app.buscarAnuncio(1)!.estoque;
    component.solicitarCancelamento();
    component.confirmarCancelamento();
    await fixture.whenStable();

    expect(component.pedido?.estado).toBe('CANCELADO');
    expect(app.buscarAnuncio(1)!.estoque).toBe(estoqueAntes + 1);
  });
});
