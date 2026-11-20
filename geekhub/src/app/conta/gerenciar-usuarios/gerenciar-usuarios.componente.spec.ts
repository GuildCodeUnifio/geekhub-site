import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { ContaModule } from '../conta-module';
import { GerenciarUsuariosComponente } from './gerenciar-usuarios.componente';

describe('GerenciarUsuariosComponente', () => {
  let app: App;
  let roteador: Router;
  let component: GerenciarUsuariosComponente;
  let fixture: ComponentFixture<GerenciarUsuariosComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(GerenciarUsuariosComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ContaModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('permite ao admin listar usuarios, alternar permissao admin e excluir terceiros', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    expect(component.resposta?.total).toBe(2);
    const alvo = component.resposta!.usuarios.find(u => u.identificador === 2)!;
    expect(alvo.admin).toBe(false);

    component.alternarAdmin(alvo, true);
    await fixture.whenStable();
    expect(app.usuarioMockEhAdmin(2)).toBe(true);

    component.confirmarExclusao(2);
    await fixture.whenStable();
    expect(component.resposta?.total).toBe(1);
  });
});
