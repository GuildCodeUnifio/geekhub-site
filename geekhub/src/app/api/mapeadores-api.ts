import type {
  AnuncioResponse,
  CarrinhoResponse,
  CategoriaDetalheResponse,
  CategoriaResponse,
  CompraResponse,
  MeuAnuncioResponse,
  PedidoResponse,
  PerfilVendedor,
  UsuarioAdminResponse,
  VendaResponse,
  VendedorResponse,
} from '../app';
import type { UsuarioResponse } from '../cabecalho/cabecalho/cabecalho';
import type * as api from './modelos-api';

const ROTULOS_CONDICAO: Record<api.CondicaoProduto, AnuncioResponse['estado']> = {
  NOVO: 'Novo',
  USADO: 'Usado',
};

const ROTULOS_CONSERVACAO: Record<api.ConservacaoProduto, string> = {
  EXCELENTE: 'Excelente',
  BOM: 'Bom',
  REGULAR: 'Regular',
};

export function paraCondicaoApi(estado: AnuncioResponse['estado']): api.CondicaoProduto {
  return estado === 'Usado' ? 'USADO' : 'NOVO';
}

export function paraConservacaoApi(conservacao: string): api.ConservacaoProduto {
  const normalizada = conservacao.trim().toLowerCase();
  if (normalizada === 'excelente') {
    return 'EXCELENTE';
  }
  if (normalizada === 'regular') {
    return 'REGULAR';
  }
  return 'BOM';
}

export function paraUsuario(
  usuario: api.DetalharUsuarioResponse | api.CadastrarUsuarioResponse,
): UsuarioResponse {
  return {
    identificador: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ...(usuario.imagemPerfil ? { foto: usuario.imagemPerfil } : {}),
  };
}

export function paraCategoria(categoria: api.ListarCategoriaResponse): CategoriaResponse {
  return { identificador: categoria.id, nome: categoria.nome };
}

export function paraCategoriaDetalhe(
  categoria: api.ListarCategoriaResponse,
): CategoriaDetalheResponse {
  return {
    identificador: categoria.id,
    nome: categoria.nome,
    descricao: categoria.descricao ?? '',
    ativa: categoria.ativa,
    criadoEm: categoria.criadoEm,
  };
}

export function paraUsuarioAdmin(usuario: api.ListarUsuarioResponse): UsuarioAdminResponse {
  return {
    identificador: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    ...(usuario.imagemPerfil ? { foto: usuario.imagemPerfil } : {}),
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
  };
}

export function paraAnuncioDoCatalogo(anuncio: api.ListarAnuncioResponse): AnuncioResponse {
  return {
    identificador: anuncio.id,
    nome: anuncio.nome,
    titulo: anuncio.nome,
    descricao: '',
    imagens: anuncio.imagemPrincipal ? [anuncio.imagemPrincipal] : [],
    categoriaIdentificador: anuncio.categoriaId,
    categoria: anuncio.categoriaNome,
    preco: anuncio.preco,
    estado: ROTULOS_CONDICAO[anuncio.condicao],
    conservacao: ROTULOS_CONSERVACAO[anuncio.conservacao],
    estoque: anuncio.quantidadeDisponivel,
    disponivel: anuncio.quantidadeDisponivel > 0,
    vendedor: {
      identificador: anuncio.vendedorId,
      nome: anuncio.vendedorNome,
      media: null,
      contagem: 0,
    },
  };
}

export function paraAnuncio(anuncio: api.DetalharAnuncioResponse): AnuncioResponse {
  return {
    identificador: anuncio.id,
    nome: anuncio.nome,
    titulo: anuncio.nome,
    descricao: anuncio.descricao ?? '',
    imagens: anuncio.imagens ?? [],
    categoriaIdentificador: anuncio.categoriaId,
    categoria: anuncio.categoriaNome,
    preco: anuncio.preco,
    estado: ROTULOS_CONDICAO[anuncio.condicao],
    conservacao: ROTULOS_CONSERVACAO[anuncio.conservacao],
    estoque: anuncio.quantidadeDisponivel,
    disponivel: anuncio.disponivel,
    vendedor: {
      identificador: anuncio.vendedor.id,
      nome: anuncio.vendedor.nome,
      ...(anuncio.vendedor.imagemPerfil ? { foto: anuncio.vendedor.imagemPerfil } : {}),
      media: anuncio.vendedor.notaMedia,
      contagem: anuncio.vendedor.quantidadeAvaliacoes ?? 0,
    },
  };
}

export function paraMeuAnuncio(anuncio: api.ListarMeuAnuncioResponse): MeuAnuncioResponse {
  return {
    identificador: anuncio.id,
    nome: anuncio.nome,
    preco: anuncio.preco,
    estoque: anuncio.quantidadeDisponivel,
    disponivel: anuncio.disponivel,
    estado: ROTULOS_CONDICAO[anuncio.condicao],
    conservacao: ROTULOS_CONSERVACAO[anuncio.conservacao],
    categoria: anuncio.categoriaNome,
    imagemPrincipal: anuncio.imagemPrincipal ?? '',
    criadoEm: anuncio.criadoEm,
  };
}

export function paraAnuncioAdmin(anuncio: api.ListarAnuncioAdminResponse): MeuAnuncioResponse {
  return {
    identificador: anuncio.id,
    nome: anuncio.nome,
    preco: anuncio.preco,
    estoque: anuncio.quantidadeDisponivel,
    disponivel: anuncio.disponivel,
    estado: 'Novo',
    conservacao: '',
    categoria: anuncio.categoriaNome,
    imagemPrincipal: '',
    vendedorIdentificador: anuncio.vendedorId,
    vendedorNome: anuncio.vendedorNome,
    criadoEm: anuncio.criadoEm,
  };
}

export function paraAnuncioSalvo(
  anuncio: api.CadastrarAnuncioResponse | api.EditarAnuncioResponse,
  vendedor: VendedorResponse,
): AnuncioResponse {
  return {
    identificador: anuncio.id,
    nome: anuncio.nome,
    titulo: anuncio.nome,
    descricao: anuncio.descricao ?? '',
    imagens: anuncio.imagens ?? [],
    categoriaIdentificador: anuncio.categoriaId,
    categoria: anuncio.categoriaNome,
    preco: anuncio.preco,
    estado: ROTULOS_CONDICAO[anuncio.condicao],
    conservacao: ROTULOS_CONSERVACAO[anuncio.conservacao],
    estoque: anuncio.quantidadeDisponivel,
    disponivel: anuncio.disponivel,
    vendedor,
  };
}

export function paraPerfilVendedor(perfil: api.PerfilVendedorResponse): PerfilVendedor {
  return {
    identificador: perfil.id,
    nome: perfil.nome,
    ...(perfil.imagemPerfil ? { foto: perfil.imagemPerfil } : {}),
    media: perfil.notaMedia,
    contagem: perfil.quantidadeAvaliacoes ?? 0,
    membroDesde: Number(perfil.membroDesde?.slice(0, 4)) || new Date().getFullYear(),
    vendas: perfil.quantidadeVendas ?? 0,
    taxaResposta: null,
    avaliacoes: (perfil.avaliacoes ?? []).map(avaliacao => ({
      identificador: avaliacao.id,
      autor: avaliacao.autorNome,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario ?? '',
      data: formatarData(avaliacao.criadoEm),
    })),
    produtos: (perfil.anuncios ?? []).map(anuncio => ({
      identificador: anuncio.id,
      nome: anuncio.nome,
      preco: anuncio.preco,
      imagem: anuncio.imagemPrincipal ?? '',
    })),
  };
}

export function paraCarrinho(carrinho: api.ConsultarCarrinhoResponse): CarrinhoResponse {
  return {
    compradorIdentificador: carrinho.compradorId,
    itens: (carrinho.itens ?? []).map(item => ({
      identificador: item.id,
      anuncioIdentificador: item.anuncioId,
      nome: item.nome,
      imagem: item.imagem ?? '',
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
      disponivel: item.disponivel,
      estoqueDisponivel: item.quantidadeDisponivel,
      subtotal: item.subtotal,
    })),
    total: carrinho.total ?? 0,
  };
}

export function paraPedido(pedido: api.DetalharPedidoResponse): PedidoResponse {
  return {
    identificador: pedido.id,
    compradorIdentificador: pedido.compradorId,
    compradorNome: pedido.compradorNome,
    compradorEmail: pedido.compradorEmail,
    itens: (pedido.itens ?? []).map(item => ({
      anuncioIdentificador: item.anuncioId,
      vendedorIdentificador: item.vendedorId,
      nomeProduto: item.nomeProduto,
      imagemProduto: item.imagemProduto ?? '',
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
      subtotal: item.subtotal,
    })),
    valorTotal: pedido.valorTotal,
    estado: pedido.estado,
    historico: (pedido.historico ?? []).map(evento => ({ ...evento })),
    avaliado: Boolean(pedido.avaliado),
    criadoEm: pedido.criadoEm,
  };
}

/** A listagem de compras da API não traz imagem; o card mostra um marcador no lugar. */
export function paraCompra(compra: api.ListarCompraResponse): CompraResponse {
  return {
    identificador: compra.id,
    valorTotal: compra.valorTotal,
    estado: compra.estado,
    avaliado: Boolean(compra.avaliado),
    quantidadeItens: compra.quantidadeItens,
    imagem: '',
    criadoEm: compra.criadoEm,
  };
}

export function paraVenda(venda: api.ListarVendaResponse): VendaResponse {
  return {
    identificador: venda.id,
    compradorNome: venda.compradorNome,
    valorTotal: venda.valorTotal,
    estado: venda.estado,
    criadoEm: venda.criadoEm,
  };
}

export function paraVendaAdmin(pedido: api.ListarPedidoAdminResponse): VendaResponse {
  return {
    identificador: pedido.id,
    compradorNome: pedido.compradorNome,
    valorTotal: pedido.valorTotal,
    estado: pedido.estado,
    criadoEm: pedido.criadoEm,
  };
}

/** Converte `2026-11-13T18:30:00` em `13/11/2026` sem depender de fuso horário. */
export function formatarData(dataIso: string | null | undefined): string {
  const [ano, mes, dia] = (dataIso ?? '').slice(0, 10).split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : '';
}
