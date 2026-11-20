import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { URL_API } from '../configuracao-api';
import { AnuncioApi } from './anuncio-api';
import { AutenticacaoApi } from './autenticacao-api';
import { AvaliacaoApi } from './avaliacao-api';
import { CarrinhoApi } from './carrinho-api';
import { CategoriaApi } from './categoria-api';
import { DashboardApi } from './dashboard-api';
import { PedidoApi } from './pedido-api';
import { UsuarioApi } from './usuario-api';

describe('Clientes da API', () => {
  let http: HttpTestingController;
  const url = 'http://api.teste';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: URL_API, useValue: url },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('AutenticacaoApi faz POST /login', async () => {
    const resposta = firstValueFrom(
      TestBed.inject(AutenticacaoApi).entrar({ email: 'a@b.com', senha: '123456' }),
    );

    const requisicao = http.expectOne(`${url}/login`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({ email: 'a@b.com', senha: '123456' });
    requisicao.flush({ accessToken: 'token', expiresIn: 3600 });

    expect(await resposta).toEqual({ accessToken: 'token', expiresIn: 3600 });
  });

  it('UsuarioApi usa as rotas de usuario e perfil de vendedor', () => {
    const usuarios = TestBed.inject(UsuarioApi);

    usuarios.cadastrar({ nome: 'Ana', email: 'ana@b.com', senha: '123456' }).subscribe();
    usuarios.detalhar(2).subscribe();
    usuarios.editar(2, { nome: 'Ana', email: 'ana@b.com', imagemPerfil: null }).subscribe();
    usuarios.perfilVendedor(3).subscribe();

    expect(http.expectOne({ method: 'POST', url: `${url}/usuarios` })).toBeTruthy();
    expect(http.expectOne({ method: 'GET', url: `${url}/usuarios/2` })).toBeTruthy();
    expect(http.expectOne({ method: 'PUT', url: `${url}/usuarios/2` }).request.body).toEqual({
      nome: 'Ana',
      email: 'ana@b.com',
      imagemPerfil: null,
    });
    expect(http.expectOne({ method: 'GET', url: `${url}/usuarios/3/perfil-vendedor` })).toBeTruthy();
  });

  it('AnuncioApi envia filtros e paginacao e normaliza a pagina', async () => {
    const resposta = firstValueFrom(
      TestBed.inject(AnuncioApi).pesquisar(
        { nome: 'naruto', categoriaId: 1, condicao: undefined },
        { pagina: 1, tamanho: 8 },
      ),
    );

    const requisicao = http.expectOne(req => req.url === `${url}/anuncios`);
    expect(requisicao.request.params.keys().sort()).toEqual(['categoriaId', 'nome', 'page', 'size']);
    expect(requisicao.request.params.get('page')).toBe('1');
    requisicao.flush({
      content: [{ id: 1 }],
      page: { size: 8, number: 1, totalElements: 9, totalPages: 2 },
    });

    expect(await resposta).toEqual({
      itens: [{ id: 1 }],
      numero: 1,
      tamanho: 8,
      totalElementos: 9,
      totalPaginas: 2,
    });
  });

  it('AnuncioApi detalha um anuncio', () => {
    TestBed.inject(AnuncioApi).detalhar(5).subscribe();
    expect(http.expectOne({ method: 'GET', url: `${url}/anuncios/5` })).toBeTruthy();
  });

  it('CategoriaApi lista categorias ativas', () => {
    TestBed.inject(CategoriaApi).listar({ ativa: true }, { tamanho: 50 }).subscribe();

    const requisicao = http.expectOne(req => req.url === `${url}/categorias`);
    expect(requisicao.request.params.get('ativa')).toBe('true');
    expect(requisicao.request.params.get('size')).toBe('50');
  });

  it('CarrinhoApi usa as rotas do carrinho', () => {
    const carrinho = TestBed.inject(CarrinhoApi);

    carrinho.consultar().subscribe();
    carrinho.adicionarItem({ anuncioId: 1, quantidade: 2 }).subscribe();
    carrinho.editarItem(7, { quantidade: 3 }).subscribe();
    carrinho.removerItem(7).subscribe();
    carrinho.limpar().subscribe();

    expect(http.expectOne({ method: 'GET', url: `${url}/carrinho` })).toBeTruthy();
    expect(http.expectOne({ method: 'POST', url: `${url}/carrinho/itens` }).request.body).toEqual({
      anuncioId: 1,
      quantidade: 2,
    });
    expect(http.expectOne({ method: 'PUT', url: `${url}/carrinho/itens/7` }).request.body).toEqual({
      quantidade: 3,
    });
    expect(http.expectOne({ method: 'DELETE', url: `${url}/carrinho/itens/7` })).toBeTruthy();
    expect(http.expectOne({ method: 'DELETE', url: `${url}/carrinho` })).toBeTruthy();
  });

  it('PedidoApi cria, lista compras por estado e detalha', () => {
    const pedidos = TestBed.inject(PedidoApi);

    pedidos.criar().subscribe();
    pedidos.listarCompras({ estado: 'CONCLUIDO' }, { pagina: 0, tamanho: 4 }).subscribe();
    pedidos.detalhar(10).subscribe();

    expect(http.expectOne({ method: 'POST', url: `${url}/pedidos` })).toBeTruthy();
    const listagem = http.expectOne(req => req.url === `${url}/pedidos/compras`);
    expect(listagem.request.params.get('estado')).toBe('CONCLUIDO');
    expect(listagem.request.params.get('size')).toBe('4');
    listagem.flush({ content: [], size: 4, number: 0, totalElements: 0, totalPages: 0 });
    expect(http.expectOne({ method: 'GET', url: `${url}/pedidos/10` })).toBeTruthy();
  });

  it('AvaliacaoApi cadastra e lista avaliacoes por vendedor', () => {
    const avaliacoes = TestBed.inject(AvaliacaoApi);

    avaliacoes.cadastrar({ pedidoId: 4, nota: 5, comentario: 'Top' }).subscribe();
    avaliacoes.listar({ vendedorId: 3 }).subscribe();

    expect(http.expectOne({ method: 'POST', url: `${url}/avaliacoes` }).request.body).toEqual({
      pedidoId: 4,
      nota: 5,
      comentario: 'Top',
    });
    expect(
      http.expectOne(req => req.url === `${url}/avaliacoes` && req.method === 'GET').request.params.get('vendedorId'),
    ).toBe('3');
  });

  it('DashboardApi consulta GET /dashboard', async () => {
    const resposta = firstValueFrom(TestBed.inject(DashboardApi).consultar());

    const requisicao = http.expectOne({ method: 'GET', url: `${url}/dashboard` });
    const payload = {
      receitaTotal: 150,
      ticketMedio: 150,
      totalPedidos: 1,
      pedidosConcluidos: 1,
      pedidosEmAndamento: 0,
      pedidosCancelados: 0,
      taxaConclusao: 100,
      totalAnuncios: 2,
      anunciosDisponiveis: 2,
      anunciosIndisponiveis: 0,
      unidadesEmEstoque: 5,
      totalCategoriasAtivas: 1,
      notaMediaAvaliacoes: 5,
      totalAvaliacoes: 1,
      pedidosPorEstado: [],
      anunciosPorCategoria: [],
      pedidosRecentes: [],
    };
    requisicao.flush(payload);

    expect(await resposta).toEqual(payload);
  });
});
