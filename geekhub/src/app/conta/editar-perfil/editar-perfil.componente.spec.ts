import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { ContaModule } from '../conta-module';
import { EditarPerfilComponente } from './editar-perfil.componente';

describe('EditarPerfilComponente', () => {
  let app: App;
  let roteador: Router;
  let component: EditarPerfilComponente;
  let fixture: ComponentFixture<EditarPerfilComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(EditarPerfilComponente);
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

  it('redireciona para o login quando nao ha sessao', async () => {
    await criarComponente();

    expect(roteador.navigate).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/minha-conta/perfil' },
    });
  });

  it('preenche o formulario com os dados do usuario atual', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    expect(component.nome).toBe('Usuário GeekHub');
    expect(component.email).toBe('demo@geekhub.com');
  });

  it('salva as alteracoes e atualiza a sessao', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.nome = 'Novo Nome';
    component.email = 'NOVO@geekhub.com';
    component.foto = 'https://exemplo.com/foto.png';
    component.salvar();

    expect(component.mensagemSucesso).toBe('Perfil atualizado com sucesso.');
    expect(app.usuarioAtual).toEqual({
      identificador: 1,
      nome: 'Novo Nome',
      email: 'novo@geekhub.com',
      foto: 'https://exemplo.com/foto.png',
    });
    expect(app.entrar({ email: 'novo@geekhub.com', senha: '123456' })).not.toBeNull();
  });

  it('valida campos obrigatorios e formato de e-mail e foto', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.nome = '  ';
    component.email = 'invalido';
    component.foto = 'ftp://foto';
    component.salvar();

    expect(component.errosCampos.nome).toBe('Informe seu nome.');
    expect(component.errosCampos.email).toBe('Informe um e-mail válido.');
    expect(component.errosCampos.foto).toContain('http');
    expect(app.usuarioAtual?.nome).toBe('Usuário GeekHub');
  });

  it('bloqueia e-mail ja usado por outra conta', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.email = 'teste@geekhub.com';
    component.salvar();

    expect(component.mensagemErro).toBe('Este e-mail já está em uso por outra conta.');
    expect(app.usuarioAtual?.email).toBe('demo@geekhub.com');
  });
});
