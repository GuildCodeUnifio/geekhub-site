import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { AppModule } from './app-module';

describe('App — pedidos', () => {
  let app: App;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();

    app = TestBed.createComponent(App).componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('lista as compras do comprador da mais recente para a mais antiga', () => {
    const resposta = app.listarCompras({ compradorIdentificador: 1 });

    expect(resposta.total).toBe(6);
    expect(resposta.compras[0].identificador).toBe(1006);
    expect(resposta.compras.at(-1)?.identificador).toBe(1001);
    expect(app.listarCompras({ compradorIdentificador: 2 }).total).toBe(0);
  });

  it('filtra por estado e pagina as compras', () => {
    const concluidos = app.listarCompras({ compradorIdentificador: 1, estado: 'CONCLUIDO' });
    expect(concluidos.compras.map(compra => compra.identificador)).toEqual([1003, 1001]);

    const segundaPagina = app.listarCompras({
      compradorIdentificador: 1,
      pagina: 2,
      itensPorPagina: 4,
    });
    expect(segundaPagina.pagina).toBe(2);
    expect(segundaPagina.compras).toHaveLength(2);
  });

  it('detalha apenas pedidos do proprio comprador', () => {
    expect(app.detalharPedido(1, 1001)?.historico).toHaveLength(4);
    expect(app.detalharPedido(2, 1001)).toBeNull();
    expect(app.detalharPedido(1, 9999)).toBeNull();
  });

  it('cria pedido a partir do carrinho, limpa o carrinho e persiste', () => {
    const totalCarrinho = app.consultarCarrinho(1).total;
    const resultado = app.criarPedido(1);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.pedido?.identificador).toBe(1007);
    expect(resultado.pedido?.estado).toBe('CRIADO');
    expect(resultado.pedido?.valorTotal).toBe(totalCarrinho);
    expect(resultado.pedido?.itens[0].vendedorIdentificador).toBe(2);
    expect(app.consultarCarrinho(1).itens).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('geekhub.pedidos') ?? '[]')).toHaveLength(7);
  });

  it('nao cria pedido com carrinho vazio ou comprador invalido', () => {
    expect(app.criarPedido(2).mensagem).toBe('Seu carrinho está vazio.');
    expect(app.criarPedido(99).mensagem).toBe('Comprador inválido.');
  });

  it('avalia somente pedido concluido e ainda nao avaliado', () => {
    expect(app.avaliarPedido({ compradorIdentificador: 1, pedidoIdentificador: 1004, nota: 5 }).mensagem)
      .toBe('Somente pedidos concluídos podem ser avaliados.');
    expect(app.avaliarPedido({ compradorIdentificador: 1, pedidoIdentificador: 1001, nota: 5 }).mensagem)
      .toBe('Este pedido já foi avaliado.');
    expect(app.avaliarPedido({ compradorIdentificador: 1, pedidoIdentificador: 1003, nota: 6 }).mensagem)
      .toBe('Informe uma nota de 1 a 5.');

    const resultado = app.avaliarPedido({
      compradorIdentificador: 1,
      pedidoIdentificador: 1003,
      nota: 4,
      comentario: 'Chegou certinho.',
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.pedido?.avaliado).toBe(true);
    expect(app.buscarVendedor(2)?.avaliacoes[0].comentario).toBe('Chegou certinho.');
  });
});
