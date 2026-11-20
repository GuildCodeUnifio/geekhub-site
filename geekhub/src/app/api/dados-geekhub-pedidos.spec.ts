import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import type { App } from '../app';
import { URL_TESTE, autenticar, configurarModoApi } from './apoio-testes-api';
import { SessaoApi } from './sessao-api';

const PEDIDO = {
  id: 4,
  compradorId: 2,
  compradorNome: 'Usuario GeekHub',
  compradorEmail: 'usuario@geekhub.com',
  itens: [
    {
      anuncioId: 2,
      vendedorId: 3,
      nomeProduto: 'Mangá',
      imagemProduto: null,
      precoUnitario: 49.9,
      quantidade: 1,
      subtotal: 49.9,
    },
  ],
  valorTotal: 49.9,
  estado: 'CONCLUIDO',
  historico: [
    { estado: 'CRIADO', ocorridoEm: '2026-11-13T18:45:00' },
    { estado: 'CONCLUIDO', ocorridoEm: '2026-11-14T10:00:00' },
  ],
  avaliado: false,
  criadoEm: '2026-11-13T18:45:00',
};

describe('DadosGeekhub — pedidos e perfil pela API', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoApi());
    autenticar();
    app.definirUsuarioAtual({ identificador: 2, nome: 'Usuario GeekHub', email: 'usuario@geekhub.com' });
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('cria pedido a partir do carrinho', async () => {
    const resposta = firstValueFrom(app.dados.criarPedido(2));
    http.expectOne({ method: 'POST', url: `${URL_TESTE}/pedidos` }).flush({ ...PEDIDO, estado: 'CRIADO' });

    const resultado = await resposta;
    expect(resultado.sucesso).toBe(true);
    expect(resultado.pedido).toMatchObject({ identificador: 4, estado: 'CRIADO', itens: [{ anuncioIdentificador: 2, imagemProduto: '' }] });
  });

  it('informa erro de negocio ao criar pedido', async () => {
    const resposta = firstValueFrom(app.dados.criarPedido(2));
    http
      .expectOne({ method: 'POST', url: `${URL_TESTE}/pedidos` })
      .flush({ erro: 'O carrinho está vazio.' }, { status: 400, statusText: 'Bad Request' });

    expect(await resposta).toEqual({ sucesso: false, mensagem: 'O carrinho está vazio.', pedido: null });
  });

  it('lista compras por estado com paginacao', async () => {
    const resposta = firstValueFrom(
      app.dados.listarCompras({ compradorIdentificador: 2, estado: 'CONCLUIDO', pagina: 1, itensPorPagina: 4 }),
    );

    const requisicao = http.expectOne(req => req.url === `${URL_TESTE}/pedidos/compras`);
    expect(requisicao.request.params.get('estado')).toBe('CONCLUIDO');
    expect(requisicao.request.params.get('page')).toBe('0');
    expect(requisicao.request.params.get('size')).toBe('4');
    requisicao.flush({
      content: [{ id: 4, valorTotal: 49.9, estado: 'CONCLUIDO', avaliado: true, quantidadeItens: 1, criadoEm: '2026-11-13T18:45:00' }],
      page: { size: 4, number: 0, totalElements: 1, totalPages: 1 },
    });

    expect(await resposta).toEqual({
      compras: [
        { identificador: 4, valorTotal: 49.9, estado: 'CONCLUIDO', avaliado: true, quantidadeItens: 1, imagem: '', criadoEm: '2026-11-13T18:45:00' },
      ],
      pagina: 1,
      itensPorPagina: 4,
      total: 1,
    });
  });

  it('retorna null para pedido de outro comprador', async () => {
    const resposta = firstValueFrom(app.dados.detalharPedido(2, 1));
    http
      .expectOne(`${URL_TESTE}/pedidos/1`)
      .flush({ erro: 'Acesso negado' }, { status: 403, statusText: 'Forbidden' });

    expect(await resposta).toBeNull();
  });

  it('avalia o pedido e recarrega os detalhes', async () => {
    const resposta = firstValueFrom(
      app.dados.avaliarPedido({ compradorIdentificador: 2, pedidoIdentificador: 4, nota: 5, comentario: ' Ótimo ' }),
    );

    const avaliacao = http.expectOne({ method: 'POST', url: `${URL_TESTE}/avaliacoes` });
    expect(avaliacao.request.body).toEqual({ pedidoId: 4, nota: 5, comentario: 'Ótimo' });
    avaliacao.flush({});
    http.expectOne(`${URL_TESTE}/pedidos/4`).flush({ ...PEDIDO, avaliado: true });

    const resultado = await resposta;
    expect(resultado.sucesso).toBe(true);
    expect(resultado.pedido?.avaliado).toBe(true);
  });

  it('edita o perfil mantendo a sessao quando o e-mail nao muda', async () => {
    const resposta = firstValueFrom(
      app.dados.editarPerfil({ usuarioIdentificador: 2, nome: 'Novo Nome', email: 'usuario@geekhub.com', foto: '' }),
    );

    const edicao = http.expectOne({ method: 'PUT', url: `${URL_TESTE}/usuarios/2` });
    expect(edicao.request.body).toEqual({ nome: 'Novo Nome', email: 'usuario@geekhub.com', imagemPerfil: null });
    edicao.flush({ id: 2, nome: 'Novo Nome', email: 'usuario@geekhub.com', imagemPerfil: null, ativo: true, criadoEm: '' });

    const resultado = await resposta;
    expect(resultado.sucesso).toBe(true);
    expect(resultado.exigeNovoLogin).toBeUndefined();
    expect(app.usuarioAtual?.nome).toBe('Novo Nome');
  });

  it('encerra a sessao quando o e-mail e alterado', async () => {
    const resposta = firstValueFrom(
      app.dados.editarPerfil({ usuarioIdentificador: 2, nome: 'Usuario', email: 'novo@geekhub.com' }),
    );
    http
      .expectOne({ method: 'PUT', url: `${URL_TESTE}/usuarios/2` })
      .flush({ id: 2, nome: 'Usuario', email: 'novo@geekhub.com', imagemPerfil: null, ativo: true, criadoEm: '' });

    const resultado = await resposta;
    expect(resultado.exigeNovoLogin).toBe(true);
    expect(app.usuarioAtual).toBeNull();
    expect(TestBed.inject(SessaoApi).autenticado).toBe(false);
  });
});
