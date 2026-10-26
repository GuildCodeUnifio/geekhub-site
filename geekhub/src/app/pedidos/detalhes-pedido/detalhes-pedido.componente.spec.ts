import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesPedidoComponente } from './detalhes-pedido.componente';

describe('DetalhesPedidoComponente', () => {
  let component: DetalhesPedidoComponente;
  let fixture: ComponentFixture<DetalhesPedidoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalhesPedidoComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPedidoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
