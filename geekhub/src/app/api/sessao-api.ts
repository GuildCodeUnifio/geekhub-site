import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import type { LoginResponse } from './modelos-api';

const CHAVE_SESSAO_STORAGE = 'geekhub.sessaoApi';

interface SessaoArmazenada {
  accessToken: string;
  expiraEm: number;
}

/** Claims emitidas pelo geekhub-api no JWT de acesso. */
export interface ClaimsToken {
  sub?: string;
  email?: string;
  scope?: string[] | string;
  exp?: number;
  /** Ainda não emitido pela API; usado quando estiver disponível. */
  id?: number;
  [chave: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class SessaoApi {
  private sessao: SessaoArmazenada | null = this.carregar();

  /** Emite quando a API rejeita o token (401) e a sessão é descartada. */
  readonly sessaoExpirada = new Subject<void>();

  get token(): string | null {
    if (!this.sessao) {
      return null;
    }

    if (Date.now() >= this.sessao.expiraEm) {
      this.limpar();
      return null;
    }

    return this.sessao.accessToken;
  }

  get autenticado(): boolean {
    return this.token !== null;
  }

  get ehAdmin(): boolean {
    const scope = this.claims()?.scope;

    if (Array.isArray(scope)) {
      return scope.some(item => item === 'ADMIN' || item === 'SCOPE_ADMIN');
    }

    if (typeof scope === 'string') {
      return scope
        .split(/\s+/)
        .some(item => item === 'ADMIN' || item === 'SCOPE_ADMIN');
    }

    return false;
  }

  iniciar(resposta: LoginResponse): void {
    this.sessao = {
      accessToken: resposta.accessToken,
      expiraEm: Date.now() + resposta.expiresIn * 1000,
    };
    this.salvar();
  }

  limpar(): void {
    this.sessao = null;
    this.salvar();
  }

  expirar(): void {
    const estavaAutenticado = this.sessao !== null;
    this.limpar();

    if (estavaAutenticado) {
      this.sessaoExpirada.next();
    }
  }

  claims(): ClaimsToken | null {
    const token = this.token;
    return token ? decodificarToken(token) : null;
  }

  private carregar(): SessaoArmazenada | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const dados: unknown = JSON.parse(localStorage.getItem(CHAVE_SESSAO_STORAGE) ?? 'null');

      if (
        typeof dados === 'object' &&
        dados !== null &&
        typeof (dados as SessaoArmazenada).accessToken === 'string' &&
        typeof (dados as SessaoArmazenada).expiraEm === 'number'
      ) {
        return dados as SessaoArmazenada;
      }
    } catch {
      // Sessão corrompida é descartada.
    }

    return null;
  }

  private salvar(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      if (this.sessao) {
        localStorage.setItem(CHAVE_SESSAO_STORAGE, JSON.stringify(this.sessao));
      } else {
        localStorage.removeItem(CHAVE_SESSAO_STORAGE);
      }
    } catch {
      // Ignora indisponibilidade de storage no ambiente atual.
    }
  }
}

export function decodificarToken(token: string): ClaimsToken | null {
  const carga = token.split('.')[1];
  if (!carga) {
    return null;
  }

  try {
    const base64 = carga.replace(/-/g, '+').replace(/_/g, '/');
    const preenchido = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(preenchido), caractere => caractere.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as ClaimsToken;
  } catch {
    return null;
  }
}
