import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { PedidosModule } from '../pedidos-module';
import { RevisarPedidoComponente } from './revisar-pedido.componente';

describe('RevisarPedidoComponente', () => {
  let app: App;
  let roteador: Router;
  let component: RevisarPedidoComponente;
  let fixture: ComponentFixture<RevisarPedidoComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(RevisarPedidoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PedidosModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redireciona para o login quando nao ha sessao', async () => {
    await criarComponente();

    expect(roteador.navigate).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/pedidos/revisar' },
    });
  });

  it('volta ao carrinho quando ele esta vazio', async () => {
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });
    await criarComponente();

    expect(roteador.navigate).toHaveBeenCalledWith(['/carrinho']);
  });

  it('exibe itens, total e dados do comprador', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelectorAll('.item')).toHaveLength(3);
    expect(elemento.querySelector('.total')?.textContent).toMatch(/2[.,]206[.,]30/);
    expect(elemento.querySelector('.resumo-comprador')?.textContent).toContain('demo@geekhub.com');
  });

  it('confirma o pedido e navega para os detalhes', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.confirmarPedido();

    expect(roteador.navigate).toHaveBeenCalledWith(['/pedidos', 1007]);
    expect(app.consultarCarrinho(1).itens).toHaveLength(0);
  });

  it('exibe erro quando o carrinho tem item indisponivel', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    app.atualizarDisponibilidadeCarrinho(1, 1, false);
    await criarComponente();

    component.confirmarPedido();

    expect(component.mensagemErro).toContain('itens indisponíveis');
    expect(component.confirmando).toBe(false);
  });
});
