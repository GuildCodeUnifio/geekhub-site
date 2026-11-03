import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinhasComprasComponente } from './minhas-compras.componente';

describe('MinhasComprasComponente', () => {
  let component: MinhasComprasComponente;
  let fixture: ComponentFixture<MinhasComprasComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MinhasComprasComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhasComprasComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
