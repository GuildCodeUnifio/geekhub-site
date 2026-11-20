import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { CategoriasModule } from '../categorias-module';
import { GerenciarCategoriasComponente } from './gerenciar-categorias.componente';

describe('GerenciarCategoriasComponente', () => {
  let app: App;
  let roteador: Router;
  let component: GerenciarCategoriasComponente;
  let fixture: ComponentFixture<GerenciarCategoriasComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(GerenciarCategoriasComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CategoriasModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('bloqueia usuario comum e permite CRUD completo para admin', async () => {
    app.entrar({ email: 'teste@geekhub.com', senha: 'teste123' });
    await criarComponente();
    expect(component.ehAdmin).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Acesso restrito');

    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();
    expect(component.ehAdmin).toBe(true);
    expect(component.categorias.length).toBe(4);

    component.nome = 'HQs Importadas';
    component.descricao = 'Edicoes raras';
    component.salvar();
    await fixture.whenStable();

    const criada = component.categorias.find(cat => cat.nome === 'HQs Importadas');
    expect(criada).toBeDefined();

    component.editar(criada!);
    component.nome = 'Comics & HQs';
    component.ativa = false;
    component.salvar();
    await fixture.whenStable();

    expect(component.categorias.some(cat => cat.nome === 'Comics & HQs' && !cat.ativa)).toBe(true);
    expect(app.listarCategorias().some(cat => cat.nome === 'Comics & HQs')).toBe(false);

    component.confirmarExclusao(criada!.identificador);
    await fixture.whenStable();
    expect(component.categorias.some(cat => cat.identificador === criada!.identificador)).toBe(false);
  });

  it('impede exclusao de categoria vinculada a anuncios', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.confirmarExclusao(1);
    await fixture.whenStable();

    expect(component.erro).toContain('anúncios vinculados');
  });
});
