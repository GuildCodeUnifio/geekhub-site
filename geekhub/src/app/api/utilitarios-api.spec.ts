import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import {
  MENSAGEM_API_INDISPONIVEL,
  ehErroConexaoApi,
  extrairMensagemErro,
  montarParametros,
  normalizarPagina,
} from './utilitarios-api';

describe('utilitarios da API', () => {
  it('monta parametros ignorando valores vazios', () => {
    const parametros = montarParametros({ nome: '', categoriaId: 2, ativa: false }, { pagina: 0 });
    expect(parametros.toString()).toBe('categoriaId=2&ativa=false&page=0');
  });

  it('normaliza pagina serializada diretamente pelo Spring', () => {
    expect(
      normalizarPagina({ content: [1, 2], size: 2, number: 0, totalElements: 5, totalPages: 3 }),
    ).toEqual({ itens: [1, 2], numero: 0, tamanho: 2, totalElementos: 5, totalPaginas: 3 });
  });

  it('extrai mensagens do corpo de erro da API', () => {
    const validacao = new HttpErrorResponse({
      status: 400,
      error: { erro: 'Erro de validação', detalhes: ['email: deve ser válido'] },
    });
    const negocio = new HttpErrorResponse({ status: 409, error: { erro: 'E-mail já cadastrado' } });

    expect(extrairMensagemErro(validacao)).toBe('email: deve ser válido');
    expect(extrairMensagemErro(negocio)).toBe('E-mail já cadastrado');
    expect(extrairMensagemErro(new HttpErrorResponse({ status: 0 }))).toBe(MENSAGEM_API_INDISPONIVEL);
    expect(extrairMensagemErro(new HttpErrorResponse({ status: 503 }))).toBe(MENSAGEM_API_INDISPONIVEL);
    expect(extrairMensagemErro(new TimeoutError())).toBe(MENSAGEM_API_INDISPONIVEL);
    expect(ehErroConexaoApi(new HttpErrorResponse({ status: 502 }))).toBe(true);
    expect(ehErroConexaoApi(new HttpErrorResponse({ status: 504 }))).toBe(true);
    expect(ehErroConexaoApi(new TimeoutError())).toBe(true);
    expect(ehErroConexaoApi(new HttpErrorResponse({ status: 403 }))).toBe(false);
    expect(extrairMensagemErro(new HttpErrorResponse({ status: 500 }), 'Falhou')).toBe('Falhou');
  });
});
