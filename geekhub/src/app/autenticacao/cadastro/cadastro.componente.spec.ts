import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { AutenticacaoModule } from '../autenticacao-module';
import { CadastroComponente } from './cadastro.componente';

describe('CadastroComponente', () => {
  let component: CadastroComponente;
  let fixture: ComponentFixture<CadastroComponente>;
  let app: App;
  let navegar: ReturnType<typeof vi.spyOn>;
  let mensagens: string[];

  beforeEach(async () => {
    localStorage.clear();
    mensagens = [];

    await TestBed.configureTestingModule({
      imports: [AutenticacaoModule],
      providers: [
        provideRouter([]),
        App,
        {
          provide: MatSnackBar,
          useValue: {
            open: (mensagem: string) => {
              mensagens.push(mensagem);
            },
          },
        },
      ],
    }).compileComponents();

    const roteador = TestBed.inject(Router);
    app = TestBed.inject(App);

    navegar = vi
      .spyOn(roteador, 'navigate')
      .mockResolvedValue(true);

    fixture = TestBed.createComponent(CadastroComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exibe os campos iniciais do formulario e o link para entrada', () => {
    expect(component).toBeTruthy();
    expect(component.nome).toBe('');
    expect(component.email).toBe('');
    expect(component.senha).toBe('');
    expect(component.confirmacaoSenha).toBe('');
    expect(component.senhaVisivel).toBe(false);
    expect(component.confirmacaoSenhaVisivel).toBe(false);

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('input[name="nome"]')).toBeTruthy();
    expect(elemento.querySelector('input[name="email"]')).toBeTruthy();
    expect(elemento.querySelector('input[name="senha"]')).toBeTruthy();
    expect(
      elemento.querySelector('input[name="confirmacaoSenha"]')
    ).toBeTruthy();
    expect(elemento.querySelector('button[type="submit"]')?.textContent).toContain(
      'CADASTRAR'
    );

    const link = elemento.querySelector(
      'a[href="/entrar"]'
    ) as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.textContent).toContain('Entrar');
  });

  it('cadastra a conta no App e no localStorage sem expor a senha', async () => {
    const resultado = await firstValueFrom(component.cadastrarUsuario({
      nome: '  Pessoa Teste  ',
      email: '  TESTE@GEEKHUB.EXAMPLE  ',
      senha: ' demo123 ',
      confirmacaoSenha: ' demo123 ',
    }));

    expect(resultado.sucesso).toBe(true);
    expect(resultado.mensagem).toBe('Conta criada com sucesso!');
    expect(resultado.usuario).toEqual({
      identificador: 3,
      nome: 'Pessoa Teste',
      email: 'teste@geekhub.example',
    });
    expect(resultado.usuario).not.toHaveProperty('senha');
    expect(resultado.usuario).not.toHaveProperty('confirmacaoSenha');

    const autenticado = app.entrar({
      email: 'teste@geekhub.example',
      senha: ' demo123 ',
    });
    expect(autenticado).toEqual(resultado.usuario);

    const novaInstanciaApp = TestBed.createComponent(App).componentInstance;
    expect(
      novaInstanciaApp.entrar({
        email: 'teste@geekhub.example',
        senha: ' demo123 ',
      })
    ).toEqual(resultado.usuario);
  });

  it('insere uma unica conta ao tentar cadastrar duas vezes e redireciona para entrar', () => {
    component.nome = 'Pessoa Teste';
    component.email = 'unico@geekhub.com';
    component.senha = 'demo123';
    component.confirmacaoSenha = 'demo123';

    component.cadastrar();
    component.cadastrar();

    expect(mensagens).toEqual(['Conta criada com sucesso!']);
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith(['/entrar']);
    expect(component.cadastroConcluido).toBe(true);
  });

  it('exibe erros em todos os campos obrigatorios vazios sem parar no primeiro', async () => {
    const resultado = await firstValueFrom(component.cadastrarUsuario({
      nome: '   ',
      email: '   ',
      senha: '   ',
      confirmacaoSenha: '',
    }));

    expect(resultado.sucesso).toBe(false);
    expect(component.errosCampos).toEqual({
      nome: 'Informe seu nome.',
      email: 'Informe seu e-mail.',
      senha: 'Informe uma senha.',
      confirmacaoSenha: 'Confirme sua senha.',
    });
    expect(navegar).not.toHaveBeenCalled();
  });

  it('rejeita e-mail invalido e confirmacao de senha diferente', async () => {
    const resultado = await firstValueFrom(component.cadastrarUsuario({
      nome: 'João',
      email: 'email-invalido',
      senha: '123',
      confirmacaoSenha: '456',
    }));

    expect(resultado.sucesso).toBe(false);
    expect(component.errosCampos).toEqual({
      email: 'Informe um e-mail válido.',
      confirmacaoSenha: 'As senhas não coincidem.',
    });

    component.limparErroCampo('email');
    expect(component.errosCampos.email).toBeUndefined();
  });

  it('bloqueia e-mail ja cadastrado mantendo a mensagem esperada', async () => {
    const resultado = await firstValueFrom(component.cadastrarUsuario({
      nome: 'Outro Usuário',
      email: '  DEMO@GEEKHUB.COM  ',
      senha: '123',
      confirmacaoSenha: '123',
    }));

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: 'E-mail já cadastrado',
    });
    expect(component.errosCampos.email).toBe('E-mail já cadastrado');

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('E-mail já cadastrado');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('alterna visibilidade das senhas de forma independente sem apagar os valores', () => {
    component.senha = 'senha123';
    component.confirmacaoSenha = 'senha123';
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const inputSenha = elemento.querySelector(
      'input[name="senha"]'
    ) as HTMLInputElement;
    const inputConfirmacao = elemento.querySelector(
      'input[name="confirmacaoSenha"]'
    ) as HTMLInputElement;
    const botaoSenha = elemento.querySelector(
      '.botao-visibilidade-senha'
    ) as HTMLButtonElement;
    const botaoConfirmacao = elemento.querySelector(
      '.botao-visibilidade-confirmacao'
    ) as HTMLButtonElement;

    expect(inputSenha.type).toBe('password');
    expect(inputConfirmacao.type).toBe('password');

    botaoSenha.click();
    fixture.detectChanges();
    expect(inputSenha.type).toBe('text');
    expect(inputConfirmacao.type).toBe('password');
    expect(component.senha).toBe('senha123');

    botaoConfirmacao.click();
    fixture.detectChanges();
    expect(inputConfirmacao.type).toBe('text');
    expect(component.confirmacaoSenha).toBe('senha123');

    botaoSenha.click();
    botaoConfirmacao.click();
    fixture.detectChanges();
    expect(inputSenha.type).toBe('password');
    expect(inputConfirmacao.type).toBe('password');
  });
});