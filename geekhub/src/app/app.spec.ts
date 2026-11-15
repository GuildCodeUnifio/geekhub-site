import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';
import { AppModule } from './app-module';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
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

  it('renderiza o catalogo na rota inicial e a tela de entrar em /entrar', async () => {
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
  });

  it('sair limpa o usuario e navega para entrada', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const roteador = TestBed.inject(Router);

    const navegar = vi
      .spyOn(roteador, 'navigate')
      .mockResolvedValue(true);

    app.usuarioAtual = {
      identificador: 1,
      nome: 'Aluno exemplo',
      email: 'aluno@exemplo.com',
    };

    app.sair();

    expect(app.usuarioAtual).toBeNull();

    expect(navegar).toHaveBeenCalledWith(['/entrar']);
  });
});
