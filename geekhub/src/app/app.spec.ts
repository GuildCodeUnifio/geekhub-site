
import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';
import { AppModule } from './app-module';

import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

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

  it('recebe a identificacao emitida pela pagina de entrada', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const loginRealizado = new EventEmitter<UsuarioResponse>();

    app.aoAtivarRota({ loginRealizado });

    loginRealizado.emit({
      identificador: 1,
      nome: 'Usuário GeekHub',
      email: 'demo@geekhub.com',
    });

    expect(app.usuarioAtual?.email).toBe(
      'demo@geekhub.com'
    );

    app.aoDesativarRota();
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
      nome: 'Usuário GeekHub',
      email: 'demo@geekhub.com',
    };

    app.sair();

    expect(app.usuarioAtual).toBeNull();

    expect(navegar).toHaveBeenCalledWith(['/entrar']);
  });
});
