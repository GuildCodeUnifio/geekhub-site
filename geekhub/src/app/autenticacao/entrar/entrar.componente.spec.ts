import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { AutenticacaoModule } from '../autenticacao-module';
import { EntrarComponente } from './entrar.componente';

describe('EntrarComponente', () => {
  let component: EntrarComponente;
  let fixture: ComponentFixture<EntrarComponente>;
  let app: App;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AutenticacaoModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    const roteador = TestBed.inject(Router);
    app = TestBed.inject(App);

    navegar = vi.spyOn(roteador, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EntrarComponente);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('cria o componente e inicia sem usuario', () => {
    expect(component).toBeTruthy();
    expect(component.usuarioAtual).toBeNull();
    expect(component.senhaVisivel).toBe(false);
    expect(component.mensagemErro).toBe('');
  });

  it('entra com dados validos atualizando o App sem manter a senha', async () => {
    const sucesso = await firstValueFrom(component.entrar({
      email: ' DEMO@GEEKHUB.COM ',
      senha: '123456',
    }));

    expect(sucesso).toBe(true);

    expect(component.usuarioAtual).toMatchObject({
      identificador: 1,
      nome: 'Usuário GeekHub',
      email: 'demo@geekhub.com',
    });

    expect(component.usuarioAtual).not.toHaveProperty('senha');
    expect(app.usuarioAtual).toEqual(component.usuarioAtual);
    expect(component.mensagemErro).toBe('');
    expect(navegar).toHaveBeenCalledWith(['/']);
  });

  it.each([
    ['', '123456', 'email'],
    ['demo@geekhub.com', '', 'senha'],
    ['   ', '   ', 'email'],
  ])('rejeita campos obrigatorios vazios', async (email, senha, campo) => {
    const sucesso = await firstValueFrom(component.entrar({
      email,
      senha,
    }));

    expect(sucesso).toBe(false);
    expect(component.errosCampos[campo as 'email' | 'senha']).toBeTruthy();

    expect(component.usuarioAtual).toBeNull();
    expect(app.usuarioAtual).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it.each([['email-invalido'], ['sem-arroba.com'], ['usuario@'], ['@dominio.com']])(
    'rejeita formato de e-mail invalido',
    async (email) => {
      const sucesso = await firstValueFrom(component.entrar({
        email,
        senha: '123456',
      }));

      expect(sucesso).toBe(false);
      expect(component.errosCampos.email).toBe('Informe um e-mail válido.');
      expect(component.usuarioAtual).toBeNull();
      expect(app.usuarioAtual).toBeNull();
      expect(navegar).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['naoexiste@geekhub.com', '123456'],
    ['demo@geekhub.com', 'senhaerrada'],
  ])('rejeita credenciais nao cadastradas ou senha incorreta', async (email, senha) => {
    const sucesso = await firstValueFrom(component.entrar({
      email,
      senha,
    }));

    expect(sucesso).toBe(false);
    expect(component.mensagemErro).toBe('E-mail ou senha incorretos.');
    expect(component.usuarioAtual).toBeNull();
    expect(app.usuarioAtual).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('mostra e oculta a senha sem alterar o texto', () => {
    component.senha = 'minhaSenha123';

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[name="senha"]') as HTMLInputElement;

    const botao = fixture.nativeElement.querySelector('.botao-visibilidade') as HTMLButtonElement;

    expect(input.type).toBe('password');

    botao.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(component.senha).toBe('minhaSenha123');

    botao.click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
    expect(component.senha).toBe('minhaSenha123');
  });

  it('exibe o link de criacao de conta', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[href="/cadastro"]',
    ) as HTMLAnchorElement | null;

    expect(link).not.toBeNull();

    expect(link?.textContent).toContain('Criar conta');
  });

  it('redireciona para a rota informada no query param redirecionar apos entrar', async () => {
    await TestBed.resetTestingModule();
    localStorage.clear();

    const { ActivatedRoute } = await import('@angular/router');
    await TestBed.configureTestingModule({
      imports: [AutenticacaoModule],
      providers: [
        provideRouter([]),
        App,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (chave: string) => (chave === 'redirecionar' ? '/produtos/1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    const novoRoteador = TestBed.inject(Router);
    const spyNovoByUrl = vi.spyOn(novoRoteador, 'navigateByUrl').mockResolvedValue(true);
    const novoFixture = TestBed.createComponent(EntrarComponente);
    const novoComponent = novoFixture.componentInstance;

    const sucesso = await firstValueFrom(novoComponent.entrar({
      email: 'demo@geekhub.com',
      senha: '123456',
    }));

    expect(sucesso).toBe(true);
    expect(spyNovoByUrl).toHaveBeenCalledWith('/produtos/1');
  });
});
