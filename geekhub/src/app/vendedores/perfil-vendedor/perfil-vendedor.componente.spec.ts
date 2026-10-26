import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilVendedorComponente } from './perfil-vendedor.componente';

describe('PerfilVendedorComponente', () => {
  let component: PerfilVendedorComponente;
  let fixture: ComponentFixture<PerfilVendedorComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilVendedorComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilVendedorComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
