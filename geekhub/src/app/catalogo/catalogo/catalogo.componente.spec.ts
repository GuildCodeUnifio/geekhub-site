import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '../../app';
import { CatalogoModule } from '../catalogo-module';
import { CatalogoComponente } from './catalogo.componente';

describe('CatalogoComponente', () => {
  let component: CatalogoComponente;
  let fixture: ComponentFixture<CatalogoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
