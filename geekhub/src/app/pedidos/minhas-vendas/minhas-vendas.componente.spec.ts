import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { PedidosModule } from '../pedidos-module';
import { MinhasVendasComponente } from './minhas-vendas.componente';

describe('MinhasVendasComponente', () => {
  let app: App;
  let roteador: Router;
  let component: MinhasVendasComponente;
  let fixture: ComponentFixture<MinhasVendasComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(MinhasVendasComponente);
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
      queryParams: { redirecionar: '/pedidos/vendas' },
    });
  });

  it('permite admin listar, filtrar, avancar estado, cancelar e remover pedidos', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    expect(component.incluirTodosAdmin).toBe(true);
    expect(component.resposta?.total).toBe(6);

    component.filtrar('CRIADO');
    await fixture.whenStable();
    expect(component.resposta?.vendas.map(v => v.identificador)).toEqual([1006]);

    component.avancarEstado(1006, 'CRIADO');
    await fixture.whenStable();
    expect(app.detalharPedido(1, 1006)?.estado).toBe('CONFIRMADO');

    component.filtrar('CONFIRMADO');
    await fixture.whenStable();
    component.confirmarCancelamento(1006);
    await fixture.whenStable();
    expect(app.detalharPedido(1, 1006)?.estado).toBe('CANCELADO');

    component.filtrar(undefined);
    await fixture.whenStable();
    component.confirmarExclusao(1002);
    await fixture.whenStable();
    expect(app.detalharPedido(1, 1002)).toBeNull();
  });
});
