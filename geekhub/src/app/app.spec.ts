import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';
import { AppModule } from './app-module';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exibe o cabecalho e inicia sem usuario', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    expect(fixture.componentInstance.usuarioAtual).toBeNull();

    expect(
      fixture.nativeElement.querySelector('app-cabecalho')
    ).toBeTruthy();
  });

  it('entrar preenche usuarioAtual quando credenciais sao validas sem expor a senha', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const usuario = app.entrar({
      email: ' DEMO@GEEKHUB.COM ',
      senha: '123456',
    });

    expect(usuario).toEqual({
      identificador: 1,
      nome: 'Usuário GeekHub',
      email: 'demo@geekhub.com',
    });

    expect(usuario).not.toHaveProperty('senha');
    expect(app.usuarioAtual).toEqual(usuario);
  });

  it('entrar retorna null quando credenciais sao invalidas', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const usuario = app.entrar({
      email: 'inexistente@geekhub.com',
      senha: '123456',
    });

    expect(usuario).toBeNull();
    expect(app.usuarioAtual).toBeNull();
  });

  it('cadastrar persiste a conta no localStorage e permite login em nova instancia', () => {
    const primeiraInstancia = TestBed.createComponent(App).componentInstance;

    const cadastrado = primeiraInstancia.cadastrar({
      nome: '  Maria Silva  ',
      email: '  MARIA@GEEKHUB.COM  ',
      senha: ' minhaSenha ',
    });

    expect(cadastrado).toEqual({
      identificador: 3,
      nome: 'Maria Silva',
      email: 'maria@geekhub.com',
    });
    expect(cadastrado).not.toHaveProperty('senha');

    const segundaInstancia = TestBed.createComponent(App).componentInstance;
    const autenticado = segundaInstancia.entrar({
      email: 'maria@geekhub.com',
      senha: ' minhaSenha ',
    });

    expect(autenticado).toEqual(cadastrado);
    expect(segundaInstancia.usuarioAtual).toEqual(cadastrado);

    const terceiraInstancia = TestBed.createComponent(App).componentInstance;
    expect(terceiraInstancia.usuarioAtual).toEqual(cadastrado);
  });

  it('cadastrar retorna null quando o e-mail ja existe', () => {
    const app = TestBed.createComponent(App).componentInstance;

    const duplicado = app.cadastrar({
      nome: 'Outro Nome',
      email: '  DEMO@GEEKHUB.COM  ',
      senha: '123',
    });

    expect(duplicado).toBeNull();
  });

  it('renderiza o catalogo na rota inicial e as telas de entrada e cadastro', async () => {
    const fixture = TestBed.createComponent(App);
    const roteador = TestBed.inject(Router);

    await roteador.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-catalogo')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Action figure Naruto');

    await roteador.navigateByUrl('/entrar');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-entrar')).toBeTruthy();

    await roteador.navigateByUrl('/cadastro');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-cadastro')).toBeTruthy();
  });

  it('sair limpa o usuario em memoria e no localStorage e navega para entrada', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const roteador = TestBed.inject(Router);

    const navegar = vi
      .spyOn(roteador, 'navigate')
      .mockResolvedValue(true);

    app.entrar({
      email: 'demo@geekhub.com',
      senha: '123456',
    });

    app.sair();

    expect(app.usuarioAtual).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/entrar']);

    const novaInstancia = TestBed.createComponent(App).componentInstance;
    expect(novaInstancia.usuarioAtual).toBeNull();
  });
});
