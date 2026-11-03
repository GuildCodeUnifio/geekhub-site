import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevisarPedidoComponente } from './revisar-pedido.componente';

describe('RevisarPedidoComponente', () => {
  let component: RevisarPedidoComponente;
  let fixture: ComponentFixture<RevisarPedidoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevisarPedidoComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisarPedidoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
