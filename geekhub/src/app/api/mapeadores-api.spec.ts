import {
  formatarData,
  paraAnuncio,
  paraAnuncioDoCatalogo,
  paraCarrinho,
  paraDashboard,
  paraPerfilVendedor,
  paraUsuario,
} from './mapeadores-api';

describe('mapeadores da API', () => {
  it('converte anuncio detalhado para o modelo do catalogo', () => {
    const anuncio = paraAnuncio({
      id: 1,
      nome: 'Action figure',
      descricao: 'Lacrado',
      categoriaId: 1,
      categoriaNome: 'Figuras colecionáveis',
      preco: 1850,
      quantidadeDisponivel: 3,
      disponivel: true,
      condicao: 'NOVO',
      conservacao: 'EXCELENTE',
      imagens: ['a.jpg'],
      vendedor: { id: 3, nome: 'Vendedor', imagemPerfil: null, notaMedia: 4.5, quantidadeAvaliacoes: 2 },
      criadoEm: '2026-11-13T18:10:00',
    });

    expect(anuncio).toMatchObject({
      identificador: 1,
      estado: 'Novo',
      conservacao: 'Excelente',
      estoque: 3,
      vendedor: { identificador: 3, media: 4.5, contagem: 2 },
    });
    expect(anuncio.vendedor.foto).toBeUndefined();
  });

  it('converte anuncio da listagem sem imagem', () => {
    const anuncio = paraAnuncioDoCatalogo({
      id: 2,
      nome: 'HQ',
      preco: 139.9,
      imagemPrincipal: null,
      categoriaId: 2,
      categoriaNome: 'Quadrinhos',
      condicao: 'USADO',
      conservacao: 'REGULAR',
      quantidadeDisponivel: 4,
      vendedorId: 2,
      vendedorNome: 'Usuario',
      criadoEm: '2026-11-13T18:13:00',
    });

    expect(anuncio.imagens).toEqual([]);
    expect(anuncio.estado).toBe('Usado');
    expect(anuncio.vendedor).toEqual({ identificador: 2, nome: 'Usuario', media: null, contagem: 0 });
  });

  it('converte carrinho preservando o id do item', () => {
    const carrinho = paraCarrinho({
      compradorId: 2,
      total: 99.8,
      itens: [
        {
          id: 9,
          anuncioId: 2,
          vendedorId: 3,
          nome: 'Mangá',
          imagem: null,
          precoUnitario: 49.9,
          quantidade: 2,
          quantidadeDisponivel: 5,
          disponivel: true,
          subtotal: 99.8,
        },
      ],
    });

    expect(carrinho.compradorIdentificador).toBe(2);
    expect(carrinho.itens[0]).toMatchObject({ identificador: 9, anuncioIdentificador: 2, estoqueDisponivel: 5, imagem: '' });
  });

  it('converte perfil de vendedor e usuario', () => {
    const perfil = paraPerfilVendedor({
      id: 3,
      nome: 'Vendedor',
      imagemPerfil: 'foto.png',
      membroDesde: '2026-11-13T18:00:00',
      notaMedia: 5,
      quantidadeAvaliacoes: 1,
      quantidadeProdutos: 1,
      quantidadeVendas: 4,
      avaliacoes: [
        {
          id: 1,
          pedidoId: 4,
          autorId: 2,
          autorNome: 'Usuario',
          autorImagemPerfil: null,
          nota: 5,
          comentario: 'Ótimo',
          criadoEm: '2026-11-13T18:50:00',
        },
      ],
      anuncios: [],
    });

    expect(perfil).toMatchObject({ membroDesde: 2026, vendas: 4, taxaResposta: null, foto: 'foto.png' });
    expect(perfil.avaliacoes[0]).toEqual({ identificador: 1, autor: 'Usuario', nota: 5, comentario: 'Ótimo', data: '13/11/2026' });

    expect(
      paraUsuario({ id: 2, nome: 'Usuario', email: 'u@g.com', imagemPerfil: null, ativo: true, criadoEm: '' }),
    ).toEqual({ identificador: 2, nome: 'Usuario', email: 'u@g.com' });
  });

  it('formata datas da API', () => {
    expect(formatarData('2026-01-05T10:00:00')).toBe('05/01/2026');
    expect(formatarData(null)).toBe('');
  });

  it('converte indicadores do dashboard da API com rotulos de estado e fonte api', () => {
    const dashboard = paraDashboard({
      receitaTotal: 2922.6,
      ticketMedio: 584.52,
      totalPedidos: 6,
      pedidosConcluidos: 2,
      pedidosEmAndamento: 3,
      pedidosCancelados: 1,
      taxaConclusao: 33,
      totalAnuncios: 11,
      anunciosDisponiveis: 10,
      anunciosIndisponiveis: 1,
      unidadesEmEstoque: 42,
      totalCategoriasAtivas: 4,
      notaMediaAvaliacoes: 5,
      totalAvaliacoes: 2,
      pedidosPorEstado: [{ estado: 'CONCLUIDO', quantidade: 2, percentual: 33 }],
      anunciosPorCategoria: [
        { nome: 'Figuras colecionáveis', quantidadeAnuncios: 4, estoqueTotal: 12, percentual: 36 },
      ],
      pedidosRecentes: [
        {
          id: 9,
          compradorNome: 'Usuário GeekHub',
          estado: 'ENVIADO',
          valorTotal: 329.9,
          quantidadeItens: 1,
          criadoEm: '2026-11-20T15:00:00',
        },
      ],
    });

    expect(dashboard.fonte).toBe('api');
    expect(dashboard.pedidosPorEstado[0]).toEqual({
      estado: 'CONCLUIDO',
      rotulo: 'Concluído',
      quantidade: 2,
      percentual: 33,
    });
    expect(dashboard.pedidosRecentes[0]).toMatchObject({
      identificador: 9,
      compradorNome: 'Usuário GeekHub',
      estado: 'ENVIADO',
    });
  });
});
