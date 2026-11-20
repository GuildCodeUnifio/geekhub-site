/**
 * Contratos (DTOs) do geekhub-api, com os mesmos nomes e campos do backend.
 * Datas `LocalDateTime` chegam como texto ISO sem fuso (ex.: 2026-11-13T18:30:00).
 */

export type CondicaoProduto = 'NOVO' | 'USADO';
export type ConservacaoProduto = 'EXCELENTE' | 'BOM' | 'REGULAR';
export type EstadoPedido = 'CRIADO' | 'CONFIRMADO' | 'ENVIADO' | 'CONCLUIDO' | 'CANCELADO';

/** Formato da página do Spring Data (aceita a serialização direta e via DTO). */
export interface PaginaSpring<T> {
  content: T[];
  page?: { size: number; number: number; totalElements: number; totalPages: number };
  size?: number;
  number?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface Pagina<T> {
  itens: T[];
  /** Índice da página, começando em 0 (padrão do Spring). */
  numero: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface Paginacao {
  /** Índice da página, começando em 0. */
  pagina?: number;
  tamanho?: number;
  ordenacao?: string;
}

export interface ErroApi {
  timestamp?: string;
  status?: number;
  erro?: string;
  detalhes?: string[];
}

// Autenticação
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

// Usuários
export interface CadastrarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  imagemPerfil?: string | null;
}

export interface CadastrarUsuarioResponse {
  id: number;
  nome: string;
  email: string;
  imagemPerfil: string | null;
  criadoEm: string;
}

export interface EditarUsuarioRequest {
  nome: string;
  email: string;
  imagemPerfil?: string | null;
}

export interface DetalharUsuarioResponse {
  id: number;
  nome: string;
  email: string;
  imagemPerfil: string | null;
  ativo: boolean;
  criadoEm: string;
}

export type EditarUsuarioResponse = DetalharUsuarioResponse;

export interface ListarUsuarioResponse {
  id: number;
  nome: string;
  email: string;
  imagemPerfil: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface AtualizarPermissaoUsuarioRequest {
  admin: boolean;
}

export interface AtualizarPermissaoUsuarioResponse {
  id: number;
  nome: string;
  email: string;
  admin: boolean;
  permissoes: string[];
}

export interface AvaliacaoPerfilVendedorResponse {
  id: number;
  pedidoId: number;
  autorId: number;
  autorNome: string;
  autorImagemPerfil: string | null;
  nota: number;
  comentario: string | null;
  criadoEm: string;
}

export interface AnuncioPerfilVendedorResponse {
  id: number;
  nome: string;
  preco: number;
  imagemPrincipal: string | null;
  categoriaId: number;
  categoriaNome: string;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  quantidadeDisponivel: number;
  criadoEm: string;
}

export interface PerfilVendedorResponse {
  id: number;
  nome: string;
  imagemPerfil: string | null;
  membroDesde: string;
  notaMedia: number | null;
  quantidadeAvaliacoes: number;
  quantidadeProdutos: number;
  quantidadeVendas: number;
  avaliacoes: AvaliacaoPerfilVendedorResponse[];
  anuncios: AnuncioPerfilVendedorResponse[];
}

// Categorias
export interface ListarCategoriaResponse {
  id: number;
  nome: string;
  descricao: string | null;
  ativa: boolean;
  criadoEm: string;
}

export interface CadastrarCategoriaRequest {
  nome: string;
  descricao?: string | null;
}

export interface EditarCategoriaRequest {
  nome: string;
  descricao?: string | null;
  ativa: boolean;
}

export type CadastrarCategoriaResponse = ListarCategoriaResponse;
export type EditarCategoriaResponse = ListarCategoriaResponse;

// Anúncios
export interface PesquisarAnunciosFiltro {
  nome?: string;
  categoriaId?: number;
  precoMin?: number;
  precoMax?: number;
  condicao?: CondicaoProduto;
  conservacao?: ConservacaoProduto;
  vendedorId?: number;
}

export interface ListarAnuncioResponse {
  id: number;
  nome: string;
  preco: number;
  imagemPrincipal: string | null;
  categoriaId: number;
  categoriaNome: string;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  quantidadeDisponivel: number;
  vendedorId: number;
  vendedorNome: string;
  criadoEm: string;
}

export interface ResumoVendedorResponse {
  id: number;
  nome: string;
  imagemPerfil: string | null;
  notaMedia: number | null;
  quantidadeAvaliacoes: number;
}

export interface DetalharAnuncioResponse {
  id: number;
  nome: string;
  descricao: string | null;
  categoriaId: number;
  categoriaNome: string;
  preco: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  imagens: string[];
  vendedor: ResumoVendedorResponse;
  criadoEm: string;
}

export interface CadastrarAnuncioRequest {
  nome: string;
  descricao: string;
  categoriaId: number;
  preco: number;
  quantidadeDisponivel: number;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  imagens: string[];
}

export interface EditarAnuncioRequest extends CadastrarAnuncioRequest {
  disponivel: boolean;
}

export interface ListarMeuAnuncioResponse {
  id: number;
  nome: string;
  preco: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  categoriaNome: string;
  imagemPrincipal: string | null;
  criadoEm: string;
}

export interface ListarAnuncioAdminResponse {
  id: number;
  nome: string;
  preco: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  categoriaNome: string;
  vendedorId: number;
  vendedorNome: string;
  criadoEm: string;
}

export interface CadastrarAnuncioResponse {
  id: number;
  nome: string;
  descricao: string | null;
  categoriaId: number;
  categoriaNome: string;
  preco: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  condicao: CondicaoProduto;
  conservacao: ConservacaoProduto;
  imagens: string[];
  criadoEm: string;
}

export type EditarAnuncioResponse = CadastrarAnuncioResponse;

// Carrinho
export interface AdicionarItemCarrinhoRequest {
  anuncioId: number;
  quantidade: number;
}

export interface EditarItemCarrinhoRequest {
  quantidade: number;
}

export interface ItemCarrinhoDetalheResponse {
  id: number;
  anuncioId: number;
  vendedorId: number;
  nome: string;
  imagem: string | null;
  precoUnitario: number;
  quantidade: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  subtotal: number;
}

export interface ConsultarCarrinhoResponse {
  compradorId: number;
  itens: ItemCarrinhoDetalheResponse[];
  total: number;
}

export interface AdicionarItemCarrinhoResponse {
  id: number;
  anuncioId: number;
  nomeProduto: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  criadoEm: string;
}

export interface EditarItemCarrinhoResponse {
  id: number;
  anuncioId: number;
  nomeProduto: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

// Pedidos
export interface ItemPedidoResponse {
  anuncioId: number;
  vendedorId: number;
  nomeProduto: string;
  imagemProduto: string | null;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface EventoPedidoResponse {
  estado: EstadoPedido;
  ocorridoEm: string;
}

export interface DetalharPedidoResponse {
  id: number;
  compradorId: number;
  compradorNome: string;
  compradorEmail: string;
  itens: ItemPedidoResponse[];
  valorTotal: number;
  estado: EstadoPedido;
  historico: EventoPedidoResponse[];
  avaliado: boolean;
  criadoEm: string;
}

export type CriarPedidoResponse = DetalharPedidoResponse;

export interface ListarCompraResponse {
  id: number;
  valorTotal: number;
  estado: EstadoPedido;
  avaliado: boolean;
  quantidadeItens: number;
  criadoEm: string;
}

export interface AtualizarEstadoPedidoRequest {
  estado: EstadoPedido;
}

export interface AtualizarEstadoPedidoResponse {
  id: number;
  estado: EstadoPedido;
  historico: EventoPedidoResponse[];
  avaliado: boolean;
}

export interface ListarVendaResponse {
  id: number;
  compradorNome: string;
  valorTotal: number;
  estado: EstadoPedido;
  criadoEm: string;
}

export interface ListarPedidoAdminResponse {
  id: number;
  compradorId: number;
  compradorNome: string;
  compradorEmail: string;
  valorTotal: number;
  estado: EstadoPedido;
  avaliado: boolean;
  quantidadeItens: number;
  criadoEm: string;
}

// Avaliações
export interface CadastrarAvaliacaoRequest {
  pedidoId: number;
  nota: number;
  comentario?: string | null;
}

export interface CadastrarAvaliacaoResponse {
  id: number;
  pedidoId: number;
  vendedorId: number;
  autorId: number;
  autorNome: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
}

export interface ListarAvaliacaoResponse {
  id: number;
  pedidoId: number;
  vendedorId: number;
  autor: { id: number; nome: string; imagemPerfil: string | null };
  nota: number;
  comentario: string | null;
  criadoEm: string;
}

// Dashboard (ADMIN)
export interface EstadoPedidoKpiApiResponse {
  estado: EstadoPedido;
  quantidade: number;
  percentual: number;
}

export interface CategoriaKpiApiResponse {
  nome: string;
  quantidadeAnuncios: number;
  estoqueTotal: number;
  percentual: number;
}

export interface PedidoRecenteDashboardApiResponse {
  id: number;
  compradorNome: string;
  estado: EstadoPedido;
  valorTotal: number;
  quantidadeItens: number;
  criadoEm: string;
}

export interface ConsultarDashboardApiResponse {
  receitaTotal: number;
  ticketMedio: number;
  totalPedidos: number;
  pedidosConcluidos: number;
  pedidosEmAndamento: number;
  pedidosCancelados: number;
  taxaConclusao: number;
  totalAnuncios: number;
  anunciosDisponiveis: number;
  anunciosIndisponiveis: number;
  unidadesEmEstoque: number;
  totalCategoriasAtivas: number;
  notaMediaAvaliacoes: number | null;
  totalAvaliacoes: number;
  pedidosPorEstado: EstadoPedidoKpiApiResponse[];
  anunciosPorCategoria: CategoriaKpiApiResponse[];
  pedidosRecentes: PedidoRecenteDashboardApiResponse[];
}
