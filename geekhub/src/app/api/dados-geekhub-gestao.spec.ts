import { HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import type { App } from '../app';
import { URL_TESTE, autenticar, configurarModoApi, criarToken } from './apoio-testes-api';
import { TestBed } from '@angular/core/testing';
import { SessaoApi } from './sessao-api';

describe('DadosGeekhub — gestao de categorias, pedidos e usuarios pela API', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoApi());
    autenticar();
    app.definirUsuarioAtual({ identificador: 1, nome: 'Admin', email: 'admin@geekhub.com' });
    TestBed.inject(SessaoApi).iniciar({
      accessToken: criarToken({ scope: ['ADMIN', 'USUARIO'], id: 1 }),
      expiresIn: 3600,
    });
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('executa CRUD completo de categorias pela API', async () => {
    const lista = firstValueFrom(app.dados.listarTodasCategorias());
    http.expectOne(req => req.url === `${URL_TESTE}/categorias`).flush({
      content: [{ id: 1, nome: 'Jogos', descricao: 'Jogos retro', ativa: true, criadoEm: '' }],
    });
    expect(await lista).toHaveLength(1);

    const cadastro = firstValueFrom(app.dados.cadastrarCategoria(1, { nome: 'Miniaturas', descricao: 'RPG' }));
    http.expectOne({ method: 'POST', url: `${URL_TESTE}/categorias` }).flush({
      id: 5,
      nome: 'Miniaturas',
      descricao: 'RPG',
      ativa: true,
      criadoEm: '',
    });
    expect((await cadastro).sucesso).toBe(true);

    const edicao = firstValueFrom(app.dados.editarCategoria(5, 1, { nome: 'Miniaturas RPG', descricao: '', ativa: false }));
    http.expectOne({ method: 'PUT', url: `${URL_TESTE}/categorias/5` }).flush({
      id: 5,
      nome: 'Miniaturas RPG',
      descricao: '',
      ativa: false,
      criadoEm: '',
    });
    expect((await edicao).categoria?.ativa).toBe(false);

    const remocao = firstValueFrom(app.dados.removerCategoria(5, 1));
    http.expectOne({ method: 'DELETE', url: `${URL_TESTE}/categorias/5` }).flush(null);
    expect((await remocao).sucesso).toBe(true);
  });

  it('lista vendas, atualiza estado e remove pedido pela API', async () => {
    const vendas = firstValueFrom(app.dados.listarVendas({ vendedorIdentificador: 1, estado: 'CRIADO', pagina: 1 }));
    http.expectOne(req => req.url === `${URL_TESTE}/pedidos/vendas`).flush({
      content: [{ id: 40, compradorNome: 'Maria', valorTotal: 199, estado: 'CRIADO', criadoEm: '' }],
    });
    expect((await vendas).vendas[0]).toMatchObject({ identificador: 40, compradorNome: 'Maria' });

    const atualizacao = firstValueFrom(app.dados.atualizarEstadoPedido(40, 1, 'CONFIRMADO'));
    http.expectOne({ method: 'PUT', url: `${URL_TESTE}/pedidos/40` }).flush({
      id: 40,
      estado: 'CONFIRMADO',
      historico: [],
      avaliado: false,
    });
    http.expectOne({ method: 'GET', url: `${URL_TESTE}/pedidos/40` }).flush({
      id: 40,
      compradorId: 2,
      compradorNome: 'Maria',
      compradorEmail: 'maria@b.com',
      itens: [],
      valorTotal: 199,
      estado: 'CONFIRMADO',
      historico: [{ estado: 'CRIADO', ocorridoEm: '' }, { estado: 'CONFIRMADO', ocorridoEm: '' }],
      avaliado: false,
      criadoEm: '',
    });
    expect((await atualizacao).pedido?.estado).toBe('CONFIRMADO');

    const remocao = firstValueFrom(app.dados.removerPedido(40, 1));
    http.expectOne({ method: 'DELETE', url: `${URL_TESTE}/pedidos/40` }).flush(null);
    expect((await remocao).sucesso).toBe(true);
  });

  it('lista usuarios, alterna permissao e remove usuario pela API', async () => {
    const usuarios = firstValueFrom(app.dados.listarUsuarios(1, 1, 10));
    http.expectOne(req => req.url === `${URL_TESTE}/usuarios`).flush({
      content: [{ id: 2, nome: 'Usuario', email: 'u@b.com', imagemPerfil: null, ativo: true, criadoEm: '' }],
    });
    expect((await usuarios).usuarios).toHaveLength(1);

    const permissao = firstValueFrom(app.dados.atualizarPermissaoUsuario(2, 1, true));
    http.expectOne({ method: 'PUT', url: `${URL_TESTE}/usuarios/2/permissao` }).flush({
      id: 2,
      nome: 'Usuario',
      email: 'u@b.com',
      admin: true,
      permissoes: ['USUARIO', 'ADMIN'],
    });
    expect((await permissao).admin).toBe(true);

    const remocao = firstValueFrom(app.dados.removerUsuario(2, 1));
    http.expectOne({ method: 'DELETE', url: `${URL_TESTE}/usuarios/2` }).flush(null);
    expect((await remocao).sucesso).toBe(true);
  });
});
