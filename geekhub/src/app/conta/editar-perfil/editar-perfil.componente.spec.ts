import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarPerfilComponente } from './editar-perfil.componente';

describe('EditarPerfilComponente', () => {
  let component: EditarPerfilComponente;
  let fixture: ComponentFixture<EditarPerfilComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPerfilComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPerfilComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
