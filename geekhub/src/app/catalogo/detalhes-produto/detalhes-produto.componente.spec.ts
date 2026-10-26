import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalhesProdutoComponente } from './detalhes-produto.componente';

describe('DetalhesProdutoComponente', () => {
  let component: DetalhesProdutoComponente;
  let fixture: ComponentFixture<DetalhesProdutoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalhesProdutoComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesProdutoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
