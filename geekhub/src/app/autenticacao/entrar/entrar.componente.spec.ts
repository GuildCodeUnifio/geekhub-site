
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AutenticacaoModule } from '../autenticacao-module';
import { EntrarComponente } from './entrar.componente';

describe('EntrarComponente', () => {
  let component: EntrarComponente;
  let fixture: ComponentFixture<EntrarComponente>;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutenticacaoModule],
      providers: [provideRouter([])],
    }).compileComponents();

    const roteador = TestBed.inject(Router);

    navegar = vi
      .spyOn(roteador, 'navigate')
      .mockResolvedValue(true);

    fixture = TestBed.createComponent(EntrarComponente);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('cria o componente e inicia sem usuario', () => {
    expect(component).toBeTruthy();
    expect(component.usuarioAtual).toBeNull();
    expect(component.senhaVisivel).toBe(false);
  });

  it('entra com credenciais validas sem retornar a senha', () => {
    const listener = vi.fn();

    component.loginRealizado.subscribe(listener);

    const resultado = component.entrar({
      email: ' DEMO@GEEKHUB.COM ',
      senha: '123456',
    });

    expect(resultado.sucesso).toBe(true);

    expect(resultado.usuario).toMatchObject({
      identificador: 1,
      email: 'demo@geekhub.com',
    });

    expect(resultado.usuario).not.toHaveProperty('senha');

    expect(component.usuarioAtual).toEqual(
      resultado.usuario
    );

    expect(listener).toHaveBeenCalledWith(
      resultado.usuario
    );

    expect(navegar).toHaveBeenCalledWith(['/']);
  });

  it.each([
    ['', '123456', 'email'],
    ['demo@geekhub.com', '', 'senha'],
    ['   ', '   ', 'email'],
  ])(
    'rejeita campos obrigatorios vazios',
    (email, senha, campo) => {
      const resultado = component.entrar({
        email,
        senha,
      });

      expect(resultado.sucesso).toBe(false);
      expect(resultado.usuario).toBeUndefined();

      expect(
        component.errosCampos[campo as 'email' | 'senha']
      ).toBeTruthy();

      expect(component.usuarioAtual).toBeNull();
      expect(navegar).not.toHaveBeenCalled();
    }
  );

  it.each([
    ['naoexiste@geekhub.com', '123456'],
    ['demo@geekhub.com', 'senhaerrada'],
  ])(
    'rejeita credenciais invalidas',
    (email, senha) => {
      const resultado = component.entrar({
        email,
        senha,
      });

      expect(resultado.sucesso).toBe(false);

      expect(resultado.mensagem).toBe(
        'E-mail ou senha incorretos.'
      );

      expect(resultado.usuario).toBeUndefined();
      expect(component.usuarioAtual).toBeNull();
      expect(navegar).not.toHaveBeenCalled();
    }
  );

  it('mostra e oculta a senha sem alterar o texto', () => {
    component.senha = 'minhaSenha123';

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input[name="senha"]'
    ) as HTMLInputElement;

    const botao = fixture.nativeElement.querySelector(
      '.botao-visibilidade'
    ) as HTMLButtonElement;

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
      'a[href="/cadastro"]'
    ) as HTMLAnchorElement | null;

    expect(link).not.toBeNull();

    expect(link?.textContent).toContain(
      'Criar conta'
    );
  });
});
