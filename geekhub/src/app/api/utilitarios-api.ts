import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import type { ErroApi, Pagina, PaginaSpring, Paginacao } from './modelos-api';

type ValorParametro = string | number | boolean | null | undefined;

/** Monta query params ignorando valores vazios e convertendo a paginação para o padrão do Spring. */
export function montarParametros(
  filtros: Record<string, ValorParametro> = {},
  paginacao: Paginacao = {},
): HttpParams {
  let parametros = new HttpParams();

  const todos: Record<string, ValorParametro> = {
    ...filtros,
    page: paginacao.pagina,
    size: paginacao.tamanho,
    sort: paginacao.ordenacao,
  };

  for (const [chave, valor] of Object.entries(todos)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      parametros = parametros.set(chave, String(valor));
    }
  }

  return parametros;
}

export function normalizarPagina<T>(pagina: PaginaSpring<T>): Pagina<T> {
  const metadados = pagina.page ?? pagina;
  const itens = pagina.content ?? [];

  return {
    itens,
    numero: metadados.number ?? 0,
    tamanho: metadados.size ?? itens.length,
    totalElementos: metadados.totalElements ?? itens.length,
    totalPaginas: metadados.totalPages ?? 1,
  };
}

export const MENSAGEM_API_INDISPONIVEL =
  'Não foi possível conectar ao servidor. Verifique se a API está em execução.';

const STATUS_API_INDISPONIVEL: ReadonlySet<number> = new Set([0, 502, 503, 504]);

/** Extrai a mensagem do corpo de erro padrão do geekhub-api (`{ erro, detalhes }`). */
export function extrairMensagemErro(erro: unknown, padrao = 'Não foi possível concluir a operação.'): string {
  if (erro instanceof TimeoutError) {
    return MENSAGEM_API_INDISPONIVEL;
  }

  if (!(erro instanceof HttpErrorResponse)) {
    return erro instanceof Error && erro.message ? erro.message : padrao;
  }

  if (STATUS_API_INDISPONIVEL.has(erro.status)) {
    return MENSAGEM_API_INDISPONIVEL;
  }

  const corpo = erro.error as ErroApi | string | null;

  if (corpo && typeof corpo === 'object') {
    if (corpo.detalhes?.length) {
      return corpo.detalhes.join(' ');
    }

    if (corpo.erro) {
      return corpo.erro;
    }
  }

  if (typeof corpo === 'string' && corpo.trim()) {
    return corpo;
  }

  return padrao;
}

export function ehErroConexaoApi(erro: unknown): boolean {
  return (
    erro instanceof TimeoutError ||
    (erro instanceof HttpErrorResponse && STATUS_API_INDISPONIVEL.has(erro.status))
  );
}

export function statusErro(erro: unknown): number | null {
  return erro instanceof HttpErrorResponse ? erro.status : null;
}
