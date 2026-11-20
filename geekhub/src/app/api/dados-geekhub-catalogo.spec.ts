import { HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import type { App } from '../app';
import { URL_TESTE, autenticar, configurarModoApi } from './apoio-testes-api';

const ITEM_CARRINHO = {
  id: 7,
  anuncioId: 2,
  vendedorId: 3,
  nome: 'Mangá',
  imagem: null,
  precoUnitario: 49.9,
  quantidade: 2,
  quantidadeDisponivel: 5,
  disponivel: true,
  subtotal: 99.8,
};

describe('DadosGeekhub — catalogo e carrinho pela API', () => {
  let app: App;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    ({ app, http } = configurarModoApi());
    autenticar();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('consulta anuncios convertendo paginacao e filtros', async () => {
    const resposta = firstValueFrom(
      app.dados.consultarAnuncios({ termo: ' naruto ', categoriaIdentificador: 1, pagina: 2, itensPorPagina: 8 }),
    );

    const requisicao = http.expectOne(req => req.url === `${URL_TESTE}/anuncios`);
    expect(requisicao.request.params.get('nome')).toBe('naruto');
    expect(requisicao.request.params.get('categoriaId')).toBe('1');
    expect(requisicao.request.params.get('page')).toBe('1');
    expect(requisicao.request.params.get('size')).toBe('8');
    requisicao.flush({
      content: [
        {
          id: 1,
          nome: 'Naruto',
          preco: 1850,
          imagemPrincipal: 'a.jpg',
          categoriaId: 1,
          categoriaNome: 'Figuras',
          condicao: 'NOVO',
          conservacao: 'EXCELENTE',
          quantidadeDisponivel: 3,
          vendedorId: 3,
          vendedorNome: 'Vendedor',
          criadoEm: '',
        },
      ],
      page: { size: 8, number: 1, totalElements: 9, totalPages: 2 },
    });

    const resultado = await resposta;
    expect(resultado.pagina).toBe(2);
    expect(resultado.total).toBe(9);
    expect(resultado.anuncios[0]).toMatchObject({ identificador: 1, imagens: ['a.jpg'], estado: 'Novo' });
  });

  it('lista categorias ativas e retorna null para anuncio inexistente', async () => {
    const categorias = firstValueFrom(app.dados.listarCategorias());
    const categoriasReq = http.expectOne(req => req.url === `${URL_TESTE}/categorias`);
    expect(categoriasReq.request.params.get('ativa')).toBe('true');
    categoriasReq.flush({ content: [{ id: 1, nome: 'Jogos', descricao: null, ativa: true, criadoEm: '' }] });
    expect(await categorias).toEqual([{ identificador: 1, nome: 'Jogos' }]);

    const anuncio = firstValueFrom(app.dados.buscarAnuncio(99));
    http.expectOne(`${URL_TESTE}/anuncios/99`).flush({ erro: 'Anúncio não encontrado' }, { status: 404, statusText: 'Not Found' });
    expect(await anuncio).toBeNull();
  });

  it('altera a quantidade localizando o item do carrinho pelo anuncio', async () => {
    const resposta = firstValueFrom(
      app.dados.alterarQuantidadeCarrinho({ compradorIdentificador: 2, anuncioIdentificador: 2, quantidade: 3 }),
    );

    http.expectOne({ method: 'GET', url: `${URL_TESTE}/carrinho` }).flush({ compradorId: 2, itens: [ITEM_CARRINHO], total: 99.8 });
    const edicao = http.expectOne({ method: 'PUT', url: `${URL_TESTE}/carrinho/itens/7` });
    expect(edicao.request.body).toEqual({ quantidade: 3 });
    edicao.flush({});
    http
      .expectOne({ method: 'GET', url: `${URL_TESTE}/carrinho` })
      .flush({ compradorId: 2, itens: [{ ...ITEM_CARRINHO, quantidade: 3, subtotal: 149.7 }], total: 149.7 });

    const resultado = await resposta;
    expect(resultado.sucesso).toBe(true);
    expect(resultado.carrinho.itens[0]).toMatchObject({ identificador: 7, quantidade: 3 });
  });

  it('devolve a mensagem da API e o carrinho atual quando a operacao falha', async () => {
    const resposta = firstValueFrom(
      app.dados.adicionarAoCarrinho({ compradorIdentificador: 2, anuncioIdentificador: 5, quantidade: 1 }),
    );

    const adicao = http.expectOne({ method: 'POST', url: `${URL_TESTE}/carrinho/itens` });
    expect(adicao.request.body).toEqual({ anuncioId: 5, quantidade: 1 });
    adicao.flush({ erro: 'Anúncio indisponível' }, { status: 400, statusText: 'Bad Request' });
    http.expectOne({ method: 'GET', url: `${URL_TESTE}/carrinho` }).flush({ compradorId: 2, itens: [ITEM_CARRINHO], total: 99.8 });

    const resultado = await resposta;
    expect(resultado).toMatchObject({ sucesso: false, mensagem: 'Anúncio indisponível' });
    expect(resultado.carrinho.itens).toHaveLength(1);
  });

  it('remove item e carrega perfil de vendedor', async () => {
    const remocao = firstValueFrom(app.dados.removerDoCarrinho({ compradorIdentificador: 2, anuncioIdentificador: 2 }));
    http.expectOne({ method: 'GET', url: `${URL_TESTE}/carrinho` }).flush({ compradorId: 2, itens: [ITEM_CARRINHO], total: 99.8 });
    http.expectOne({ method: 'DELETE', url: `${URL_TESTE}/carrinho/itens/7` }).flush(null);
    http.expectOne({ method: 'GET', url: `${URL_TESTE}/carrinho` }).flush({ compradorId: 2, itens: [], total: 0 });
    expect((await remocao).carrinho.itens).toEqual([]);

    const vendedor = firstValueFrom(app.dados.buscarVendedor(3));
    http.expectOne(`${URL_TESTE}/usuarios/3/perfil-vendedor`).flush({
      id: 3,
      nome: 'Vendedor GeekHub',
      imagemPerfil: null,
      membroDesde: '2026-11-13T18:00:00',
      notaMedia: 5,
      quantidadeAvaliacoes: 1,
      quantidadeProdutos: 3,
      quantidadeVendas: 4,
      avaliacoes: [],
      anuncios: [],
    });
    expect(await vendedor).toMatchObject({ identificador: 3, vendas: 4, media: 5 });
  });
});
