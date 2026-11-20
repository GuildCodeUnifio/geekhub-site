import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { PedidosModule } from '../pedidos-module';
import { MinhasComprasComponente } from './minhas-compras.componente';

describe('MinhasComprasComponente', () => {
  let app: App;
  let roteador: Router;
  let component: MinhasComprasComponente;
  let fixture: ComponentFixture<MinhasComprasComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(MinhasComprasComponente);
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
      queryParams: { redirecionar: '/pedidos' },
    });
  });

  it('lista a primeira pagina de compras com o intervalo exibido', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelectorAll('.compra')).toHaveLength(4);
    expect(elemento.querySelector('.rodape-lista p')?.textContent).toContain('Mostrando 1 a 4 de 6 pedidos');
    expect(elemento.querySelector('.compra')?.getAttribute('href')).toBe('/pedidos/1006');
  });

  it('filtra por estado e volta para a primeira pagina', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.mudarPagina({ pageIndex: 1, pageSize: 4, length: 6 });
    expect(component.pagina).toBe(2);

    component.filtrar('CONCLUIDO');
    fixture.detectChanges();

    expect(component.pagina).toBe(1);
    expect(component.resposta?.compras.map(compra => compra.identificador)).toEqual([1003, 1001]);
  });

  it('exibe estado vazio para quem nao tem compras', async () => {
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });
    await criarComponente();

    expect(fixture.nativeElement.querySelector('.estado-vazio')?.textContent).toContain(
      'Você ainda não fez compras.',
    );
  });
});
