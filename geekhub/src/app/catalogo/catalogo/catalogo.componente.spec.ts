import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoComponente } from './catalogo.componente';

describe('CatalogoComponente', () => {
  let component: CatalogoComponente;
  let fixture: ComponentFixture<CatalogoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CatalogoComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
