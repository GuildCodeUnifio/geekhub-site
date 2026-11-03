import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntrarComponente } from './entrar.componente';

describe('EntrarComponente', () => {
  let component: EntrarComponente;
  let fixture: ComponentFixture<EntrarComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntrarComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(EntrarComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
