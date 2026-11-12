import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '../../app';
import { CatalogoModule } from '../catalogo-module';
import { DetalhesProdutoComponente } from './detalhes-produto.componente';

describe('DetalhesProdutoComponente', () => {
  let component: DetalhesProdutoComponente;
  let fixture: ComponentFixture<DetalhesProdutoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesProdutoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
