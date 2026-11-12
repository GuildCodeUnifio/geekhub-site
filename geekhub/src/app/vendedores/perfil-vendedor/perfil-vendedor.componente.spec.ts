import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '../../app';
import { VendedoresModule } from '../vendedores-module';
import { PerfilVendedorComponente } from './perfil-vendedor.componente';

describe('PerfilVendedorComponente', () => {
  let component: PerfilVendedorComponente;
  let fixture: ComponentFixture<PerfilVendedorComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendedoresModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilVendedorComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
