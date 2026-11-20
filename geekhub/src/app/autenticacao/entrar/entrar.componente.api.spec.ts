import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { URL_TESTE, configurarModoApi } from '../../api/apoio-testes-api';
import { AutenticacaoModule } from '../autenticacao-module';
import { EntrarComponente } from './entrar.componente';

describe('EntrarComponente com a API (resposta assincrona)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [AutenticacaoModule] });
    ({ http } = configurarModoApi());
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('atualiza a tela quando a API recusa as credenciais', async () => {
    const fixture = TestBed.createComponent(EntrarComponente);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const elemento: HTMLElement = fixture.nativeElement;
    const campos = elemento.querySelectorAll('input');
    (campos[0] as HTMLInputElement).value = 'usuario@geekhub.com';
    campos[0].dispatchEvent(new Event('input'));
    (campos[1] as HTMLInputElement).value = 'errada';
    campos[1].dispatchEvent(new Event('input'));
    (elemento.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(elemento.querySelector('button[type=submit]')?.textContent).toContain('ENTRANDO');

    http
      .expectOne(`${URL_TESTE}/login`)
      .flush({ erro: 'Usuário ou senha incorretos' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(elemento.querySelector('.mensagem-erro')?.textContent).toContain('E-mail ou senha incorretos.');
    expect(elemento.querySelector('button[type=submit]')?.textContent).toContain('ENTRAR');
  });
});
