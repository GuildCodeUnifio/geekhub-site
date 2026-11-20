import { Component, Injector, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { DadosGeekhub } from './api/dados-geekhub';
import type { EntrarRequest } from './autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

export interface ContaUsuario extends UsuarioResponse {
  senha: string;
  admin?: boolean;
}

export interface CadastrarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface EditarPerfilRequest {
  usuarioIdentificador: number;
  nome: string;
  email: string;
  foto?: string;
}

export interface ResultadoEdicaoPerfil {
  sucesso: boolean;
  mensagem: string;
  usuario: UsuarioResponse | null;
  /** Indica que a sessão foi encerrada (ex.: e-mail alterado invalida o token da API). */
  exigeNovoLogin?: boolean;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CHAVE_USUARIOS_STORAGE = 'geekhub.usuarios';
const CHAVE_USUARIO_ATUAL_STORAGE = 'geekhub.usuarioAtual';
const CHAVE_CARRINHOS_STORAGE = 'geekhub.carrinhos';

export interface ItemCarrinhoResponse {
  /** Identificador do item no carrinho (disponível quando os dados vêm da API). */
  identificador?: number;
  anuncioIdentificador: number;
  nome: string;
  imagem: string;
  precoUnitario: number;
  quantidade: number;
  disponivel: boolean;
  estoqueDisponivel: number;
  subtotal: number;
}

export interface CarrinhoResponse {
  compradorIdentificador: number;
  itens: ItemCarrinhoResponse[];
  total: number;
}

export interface AdicionarAoCarrinhoRequest {
  compradorIdentificador: number;
  anuncioIdentificador: number;
  quantidade: number;
  nome?: string;
  imagem?: string;
  precoUnitario?: number;
  disponivel?: boolean;
  estoqueDisponivel?: number;
}

export interface AlterarQuantidadeRequest {
  compradorIdentificador: number;
  anuncioIdentificador: number;
  quantidade: number;
}

export interface RemoverDoCarrinhoRequest {
  compradorIdentificador: number;
  anuncioIdentificador: number;
}

export interface ResultadoOperacaoCarrinho {
  sucesso: boolean;
  mensagem: string;
  carrinho: CarrinhoResponse;
}

interface ItemCarrinhoArmazenado {
  anuncioIdentificador: number;
  nome: string;
  imagem: string;
  precoUnitario: number;
  quantidade: number;
  disponivel: boolean;
  estoqueDisponivel: number;
}

const ITENS_CARRINHO_PADRAO: readonly ItemCarrinhoArmazenado[] = [
  {
    anuncioIdentificador: 1,
    nome: 'Action figure Naruto',
    imagem: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    precoUnitario: 1850.0,
    quantidade: 1,
    disponivel: true,
    estoqueDisponivel: 3,
  },
  {
    anuncioIdentificador: 2,
    nome: 'Mangá Colecionável — Edição Especial',
    imagem: 'https://cdn.myanimelist.net/images/characters/2/284121.jpg',
    precoUnitario: 49.9,
    quantidade: 2,
    disponivel: true,
    estoqueDisponivel: 5,
  },
  {
    anuncioIdentificador: 3,
    nome: 'Poster Ilustrado Ninja',
    imagem: 'https://cdn.myanimelist.net/images/characters/9/131317.jpg',
    precoUnitario: 85.5,
    quantidade: 3,
    disponivel: true,
    estoqueDisponivel: 10,
  },
];

const CONTAS_PADRAO: readonly ContaUsuario[] = [
  {
    identificador: 1,
    nome: 'Usuário GeekHub',
    email: 'demo@geekhub.com',
    senha: '123456',
    admin: true,
  },
  {
    identificador: 2,
    nome: 'Usuário Teste',
    email: 'teste@geekhub.com',
    senha: 'teste123',
  },
];

export interface PerfilVendedor {
  identificador: number;
  nome: string;
  foto?: string;
  media: number | null;
  contagem: number;
  membroDesde: number;
  vendas: number;
  /** Não fornecida pela API; `null` oculta o indicador. */
  taxaResposta: number | null;
  avaliacoes: {
    identificador: number;
    autor: string;
    nota: number;
    comentario: string;
    data: string;
  }[];
  produtos: {
    identificador: number;
    nome: string;
    preco: number;
    imagem: string;
  }[];
}

export interface CategoriaResponse {
  identificador: number;
  nome: string;
}

export interface ConsultarAnunciosRequest {
  termo?: string;
  categoriaIdentificador?: number;
  pagina?: number;
  itensPorPagina?: number;
}

export interface ConsultarAnunciosResponse {
  anuncios: AnuncioResponse[];
  pagina: number;
  itensPorPagina: number;
  total: number;
}

export interface AnuncioResponse {
  identificador: number;
  nome: string;
  titulo: string;
  descricao: string;
  imagens: string[];
  categoriaIdentificador?: number;
  categoria: string;
  preco: number;
  estado: 'Novo' | 'Usado';
  conservacao: string;
  estoque: number;
  disponivel?: boolean;
  vendedor: VendedorResponse;
}

export interface ConsultarAnuncioRequest {
  anuncioIdentificador: number;
}

const CATEGORIAS_CATALOGO: readonly CategoriaResponse[] = [
  { identificador: 1, nome: 'Figuras colecionáveis' },
  { identificador: 2, nome: 'Quadrinhos e mangás' },
  { identificador: 3, nome: 'Jogos' },
  { identificador: 4, nome: 'Acessórios' },
];

export interface VendedorResponse{
  identificador: number;
  nome: string;
  foto?: string;
  media: number | null;
  contagem: number;
}

export type EstadoPedido =
  | 'CRIADO'
  | 'CONFIRMADO'
  | 'ENVIADO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export const ESTADOS_PEDIDO: readonly EstadoPedido[] = [
  'CRIADO',
  'CONFIRMADO',
  'ENVIADO',
  'CONCLUIDO',
  'CANCELADO',
];

export const ROTULOS_ESTADO_PEDIDO: Readonly<Record<EstadoPedido, string>> = {
  CRIADO: 'Criado',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export interface ItemPedidoResponse {
  anuncioIdentificador: number;
  vendedorIdentificador: number;
  nomeProduto: string;
  imagemProduto: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface EventoPedidoResponse {
  estado: EstadoPedido;
  ocorridoEm: string;
}

export interface PedidoResponse {
  identificador: number;
  compradorIdentificador: number;
  compradorNome: string;
  compradorEmail: string;
  itens: ItemPedidoResponse[];
  valorTotal: number;
  estado: EstadoPedido;
  historico: EventoPedidoResponse[];
  avaliado: boolean;
  criadoEm: string;
}

export interface CompraResponse {
  identificador: number;
  valorTotal: number;
  estado: EstadoPedido;
  avaliado: boolean;
  quantidadeItens: number;
  imagem: string;
  criadoEm: string;
}

export interface ListarComprasRequest {
  compradorIdentificador: number;
  estado?: EstadoPedido;
  pagina?: number;
  itensPorPagina?: number;
}

export interface ListarComprasResponse {
  compras: CompraResponse[];
  pagina: number;
  itensPorPagina: number;
  total: number;
}

export interface AvaliarPedidoRequest {
  compradorIdentificador: number;
  pedidoIdentificador: number;
  nota: number;
  comentario?: string;
}

export interface ResultadoOperacaoPedido {
  sucesso: boolean;
  mensagem: string;
  pedido: PedidoResponse | null;
}

const CHAVE_PEDIDOS_STORAGE = 'geekhub.pedidos';

function criarItemPedido(
  anuncioIdentificador: number,
  vendedorIdentificador: number,
  nomeProduto: string,
  imagemProduto: string,
  precoUnitario: number,
  quantidade: number
): ItemPedidoResponse {
  return {
    anuncioIdentificador,
    vendedorIdentificador,
    nomeProduto,
    imagemProduto,
    precoUnitario,
    quantidade,
    subtotal: (Math.round(precoUnitario * 100) * quantidade) / 100,
  };
}

function criarPedidoPadrao(
  identificador: number,
  itens: ItemPedidoResponse[],
  historico: EventoPedidoResponse[],
  avaliado = false
): PedidoResponse {
  const valorTotal =
    itens.reduce((soma, item) => soma + Math.round(item.subtotal * 100), 0) / 100;

  return {
    identificador,
    compradorIdentificador: 1,
    compradorNome: 'Usuário GeekHub',
    compradorEmail: 'demo@geekhub.com',
    itens,
    valorTotal,
    estado: historico[historico.length - 1].estado,
    historico,
    avaliado,
    criadoEm: historico[0].ocorridoEm,
  };
}

const ITEM_NARUTO = criarItemPedido(
  1, 2, 'Action figure Naruto',
  'https://cdn.myanimelist.net/images/anime/13/17405.jpg', 1850.0, 1
);
const ITEM_MANGA = criarItemPedido(
  2, 2, 'Mangá Colecionável — Edição Especial',
  'https://cdn.myanimelist.net/images/characters/2/284121.jpg', 49.9, 2
);
const ITEM_POSTER = criarItemPedido(
  3, 3, 'Poster Ilustrado Ninja',
  'https://cdn.myanimelist.net/images/characters/9/131317.jpg', 85.5, 1
);
const ITEM_KAKASHI = criarItemPedido(
  4, 2, 'Estátua Kakashi Hatake 18cm',
  'https://cdn.myanimelist.net/images/characters/7/284129.jpg', 329.9, 1
);
const ITEM_BATMAN = criarItemPedido(
  5, 3, 'HQ Batman: O Cavaleiro das Trevas',
  'https://covers.openlibrary.org/b/id/12673834-L.jpg', 139.9, 1
);
const ITEM_HEADSET = criarItemPedido(
  8, 2, 'Headset Gamer RGB Profissional',
  'https://images.unsplash.com/photo-1566055972289-c52022ae23b7?auto=format&fit=crop&w=800&h=450&q=80',
  234.9, 1
);
const ITEM_D20 = criarItemPedido(
  10, 2, 'Dado D20 Colecionável RPG',
  'https://images.unsplash.com/photo-1650024520022-cab7611a460b?auto=format&fit=crop&w=800&h=450&q=80',
  118.5, 2
);

const PEDIDOS_PADRAO: readonly PedidoResponse[] = [
  criarPedidoPadrao(1001, [ITEM_KAKASHI, ITEM_POSTER], [
    { estado: 'CRIADO', ocorridoEm: '2026-09-02T10:30:00' },
    { estado: 'CONFIRMADO', ocorridoEm: '2026-09-02T11:15:00' },
    { estado: 'ENVIADO', ocorridoEm: '2026-09-03T09:20:00' },
    { estado: 'CONCLUIDO', ocorridoEm: '2026-09-05T15:45:00' },
  ], true),
  criarPedidoPadrao(1002, [ITEM_BATMAN], [
    { estado: 'CRIADO', ocorridoEm: '2026-09-18T14:05:00' },
    { estado: 'CANCELADO', ocorridoEm: '2026-09-18T18:40:00' },
  ]),
  criarPedidoPadrao(1003, [ITEM_D20], [
    { estado: 'CRIADO', ocorridoEm: '2026-10-01T08:50:00' },
    { estado: 'CONFIRMADO', ocorridoEm: '2026-10-01T09:30:00' },
    { estado: 'ENVIADO', ocorridoEm: '2026-10-02T13:10:00' },
    { estado: 'CONCLUIDO', ocorridoEm: '2026-10-06T16:00:00' },
  ]),
  criarPedidoPadrao(1004, [ITEM_HEADSET, ITEM_MANGA], [
    { estado: 'CRIADO', ocorridoEm: '2026-10-22T19:25:00' },
    { estado: 'CONFIRMADO', ocorridoEm: '2026-10-22T20:00:00' },
    { estado: 'ENVIADO', ocorridoEm: '2026-10-24T10:15:00' },
  ]),
  criarPedidoPadrao(1005, [ITEM_POSTER], [
    { estado: 'CRIADO', ocorridoEm: '2026-11-08T12:00:00' },
    { estado: 'CONFIRMADO', ocorridoEm: '2026-11-08T12:40:00' },
  ]),
  criarPedidoPadrao(1006, [ITEM_NARUTO], [
    { estado: 'CRIADO', ocorridoEm: '2026-11-15T21:10:00' },
  ]),
];

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('geekhub');

  private readonly usuarios: ContaUsuario[] = this.carregarUsuarios();
  private readonly carrinhos: Map<number, ItemCarrinhoArmazenado[]> =
    this.carregarCarrinhos();
  private readonly versaoCarrinhos = signal(0);
  private readonly usuarioAtualSinal = signal<UsuarioResponse | null>(
    this.carregarUsuarioAtual()
  );

  /** Acesso aos dados pela API ou pelos dados de exemplo, conforme `CONFIGURACAO_API`. */
  readonly dados = new DadosGeekhub(this, inject(Injector));

  get usuarioAtual(): UsuarioResponse | null {
    return this.usuarioAtualSinal();
  }

  set usuarioAtual(usuario: UsuarioResponse | null) {
    this.usuarioAtualSinal.set(usuario);
  }

  get versaoEstadoCarrinhos(): number {
    return this.versaoCarrinhos();
  }

  get usuarioAtualEhAdmin(): boolean {
    return this.dados.usuarioEhAdmin();
  }

  usuarioMockEhAdmin(identificador: number): boolean {
    return Boolean(
      this.usuarios.find(usuario => usuario.identificador === identificador)?.admin,
    );
  }

  constructor(private readonly roteador: Router) {}

  get versaoCabecalho(): 'Simples' | 'Completa' {
    const caminho = this.roteador.url.split('?')[0];

    return caminho === '/entrar' ||
      caminho === '/cadastro' ||
      caminho.startsWith('/autenticacao/')
      ? 'Simples'
      : 'Completa';
  }

  cadastrar(request: CadastrarUsuarioRequest): UsuarioResponse | null {
    const nome = request.nome.trim();
    const email = request.email.trim().toLowerCase();

    if (!nome || !email || !request.senha.trim()) {
      return null;
    }

    const emailJaCadastrado = this.usuarios.some(
      usuario => usuario.email.trim().toLowerCase() === email
    );

    if (emailJaCadastrado) {
      return null;
    }

    const proximoIdentificador =
      this.usuarios.reduce(
        (maior, usuario) => Math.max(maior, usuario.identificador),
        0
      ) + 1;

    const novaConta: ContaUsuario = {
      identificador: proximoIdentificador,
      nome,
      email,
      senha: request.senha,
    };

    this.usuarios.push(novaConta);
    this.salvarUsuarios();

    return this.paraUsuarioResponse(novaConta);
  }

  entrar(request: EntrarRequest): UsuarioResponse | null {
    const email = request.email.trim().toLowerCase();

    const conta = this.usuarios.find(
      usuario =>
        usuario.email.trim().toLowerCase() === email &&
        usuario.senha === request.senha
    );

    if (!conta) {
      this.usuarioAtual = null;
      this.salvarUsuarioAtual();
      return null;
    }

    this.usuarioAtual = this.paraUsuarioResponse(conta);
    this.salvarUsuarioAtual();

    return this.usuarioAtual;
  }

  pesquisar(termo: string): void {
    void this.roteador.navigate(['/'], {
      queryParams: {
        busca: termo || null,
      },
    });
  }

  definirUsuarioAtual(usuario: UsuarioResponse | null): void {
    this.usuarioAtual = usuario;
    this.salvarUsuarioAtual();
  }

  sair(): void {
    this.dados.encerrarSessao();
    this.usuarioAtual = null;
    this.salvarUsuarioAtual();
    void this.roteador.navigate(['/entrar']);
  }

  encerrarSessao(): void {
    this.sair();
  }

  editarPerfil(request: EditarPerfilRequest): ResultadoEdicaoPerfil {
    const nome = request.nome.trim();
    const email = request.email.trim().toLowerCase();
    const foto = request.foto?.trim() ?? '';
    const conta = this.usuarios.find(
      usuario => usuario.identificador === request.usuarioIdentificador
    );

    if (!conta) {
      return { sucesso: false, mensagem: 'Usuário não encontrado.', usuario: null };
    }

    if (!nome || nome.length > 255) {
      return { sucesso: false, mensagem: 'Informe um nome válido.', usuario: null };
    }

    if (!REGEX_EMAIL.test(email) || email.length > 255) {
      return { sucesso: false, mensagem: 'Informe um e-mail válido.', usuario: null };
    }

    if (foto.length > 512) {
      return {
        sucesso: false,
        mensagem: 'O endereço da foto deve ter no máximo 512 caracteres.',
        usuario: null,
      };
    }

    const emailEmUso = this.usuarios.some(
      usuario =>
        usuario.identificador !== conta.identificador &&
        usuario.email.trim().toLowerCase() === email
    );

    if (emailEmUso) {
      return {
        sucesso: false,
        mensagem: 'Este e-mail já está em uso por outra conta.',
        usuario: null,
      };
    }

    conta.nome = nome;
    conta.email = email;
    if (foto) {
      conta.foto = foto;
    } else {
      delete conta.foto;
    }
    this.salvarUsuarios();

    const usuario = this.paraUsuarioResponse(conta);
    if (this.usuarioAtual?.identificador === conta.identificador) {
      this.usuarioAtual = usuario;
      this.salvarUsuarioAtual();
    }

    return { sucesso: true, mensagem: 'Perfil atualizado com sucesso.', usuario };
  }

  private paraUsuarioResponse(conta: ContaUsuario): UsuarioResponse {
    return {
      identificador: conta.identificador,
      nome: conta.nome,
      email: conta.email,
      ...(conta.foto ? { foto: conta.foto } : {}),
    };
  }

  private carregarUsuarios(): ContaUsuario[] {
    const padrao = CONTAS_PADRAO.map(conta => ({ ...conta }));

    if (typeof localStorage === 'undefined') {
      return padrao;
    }

    try {
      const salvo = localStorage.getItem(CHAVE_USUARIOS_STORAGE);
      if (!salvo) {
        return padrao;
      }

      const dados: unknown = JSON.parse(salvo);
      if (!Array.isArray(dados)) {
        return padrao;
      }

      const contas = dados.filter(
        (item): item is ContaUsuario =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as ContaUsuario).identificador === 'number' &&
          typeof (item as ContaUsuario).nome === 'string' &&
          typeof (item as ContaUsuario).email === 'string' &&
          typeof (item as ContaUsuario).senha === 'string'
      );

      return contas.length > 0
        ? contas.map(conta =>
            conta.email.trim().toLowerCase() === 'demo@geekhub.com' &&
            conta.admin === undefined
              ? { ...conta, admin: true }
              : conta,
          )
        : padrao;
    } catch {
      return padrao;
    }
  }

  private salvarUsuarios(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        CHAVE_USUARIOS_STORAGE,
        JSON.stringify(this.usuarios)
      );
    } catch {
      // Ignora indisponibilidade de storage no ambiente atual.
    }
  }

  private carregarUsuarioAtual(): UsuarioResponse | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const salvo = localStorage.getItem(CHAVE_USUARIO_ATUAL_STORAGE);
      if (!salvo) {
        return null;
      }

      const dados: unknown = JSON.parse(salvo);
      if (
        typeof dados !== 'object' ||
        dados === null ||
        typeof (dados as UsuarioResponse).identificador !== 'number' ||
        typeof (dados as UsuarioResponse).nome !== 'string' ||
        typeof (dados as UsuarioResponse).email !== 'string'
      ) {
        return null;
      }

      return this.paraUsuarioResponse(dados as ContaUsuario);
    } catch {
      return null;
    }
  }

  private salvarUsuarioAtual(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      if (!this.usuarioAtual) {
        localStorage.removeItem(CHAVE_USUARIO_ATUAL_STORAGE);
      } else {
        localStorage.setItem(
          CHAVE_USUARIO_ATUAL_STORAGE,
          JSON.stringify(this.usuarioAtual)
        );
      }
    } catch {
      // Ignora indisponibilidade de storage no ambiente atual.
    }
  }

  private readonly vendedores: Omit<
    PerfilVendedor,
    'media' | 'contagem'
  >[] = [
    {
      identificador: 2,
      nome: 'Luiz Carlos Oliveira',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
      membroDesde: 2024,
      vendas: 12,
      taxaResposta: 99,
      avaliacoes: [
        {
          identificador: 1,
          autor: 'Mariana',
          nota: 5,
          comentario: 'Ótimo produto e entrega rápida!',
          data: '28/10/2026',
        },
      ],
      produtos: [],
    },
    {
      identificador: 3,
      nome: 'Marina Costa',
      foto: 'https://randomuser.me/api/portraits/women/44.jpg',
      membroDesde: 2025,
      vendas: 8,
      taxaResposta: 97,
      avaliacoes: [
        {
          identificador: 2,
          autor: 'Lucas',
          nota: 5,
          comentario: 'Item bem embalado e exatamente como anunciado.',
          data: '04/11/2026',
        },
      ],
      produtos: [],
    },
  ];

  private readonly anuncios: AnuncioResponse[] = [
    {
      identificador: 1,
      nome: 'Action figure Naruto',
      titulo: 'Action figura Naruto 1 edição',
      descricao: 'Produto original com nota fiscal',
      imagens: [
        'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        'https://cdn.myanimelist.net/images/characters/2/284121.jpg',
        'https://cdn.myanimelist.net/images/characters/9/131317.jpg',
        'https://cdn.myanimelist.net/images/characters/7/284129.jpg',
      ],
      categoriaIdentificador: 1,
      categoria: 'Figuras colecionáveis',
      preco: 1850.0,
      estado: 'Novo',
      conservacao: 'Estado do lacre original, sem arranhados e amassados',
      estoque: 3,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 2,
      nome: 'Mangá Colecionável — Edição Especial',
      titulo: 'Mangá Colecionável — Edição Especial',
      descricao: 'Volume de colecionador com sobrecapa e páginas coloridas.',
      imagens: ['https://cdn.myanimelist.net/images/characters/2/284121.jpg'],
      categoriaIdentificador: 2,
      categoria: 'Quadrinhos e mangás',
      preco: 49.9,
      estado: 'Novo',
      conservacao: 'Lacrados de fábrica, sem marcas de dobra',
      estoque: 5,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 3,
      nome: 'Poster Ilustrado Ninja',
      titulo: 'Poster Ilustrado Ninja',
      descricao: 'Impressão em papel couchê 250g com acabamento fosco.',
      imagens: ['https://cdn.myanimelist.net/images/characters/9/131317.jpg'],
      categoriaIdentificador: 4,
      categoria: 'Acessórios',
      preco: 85.5,
      estado: 'Novo',
      conservacao: 'Sem marcas de dobra, enviado em tubo protetor',
      estoque: 10,
      disponivel: true,
      vendedor: {
        identificador: 3,
        nome: 'Marina Costa',
        foto: 'https://randomuser.me/api/portraits/women/44.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 4,
      nome: 'Estátua Kakashi Hatake 18cm',
      titulo: 'Estátua Kakashi Hatake 18cm',
      descricao: 'Peça em PVC detalhada com base expositora inclusa.',
      imagens: ['https://cdn.myanimelist.net/images/characters/7/284129.jpg'],
      categoriaIdentificador: 1,
      categoria: 'Figuras colecionáveis',
      preco: 329.9,
      estado: 'Usado',
      conservacao: 'Exposto apenas em cristaleira, acompanha caixa original',
      estoque: 2,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 5,
      nome: 'HQ Batman: O Cavaleiro das Trevas',
      titulo: 'HQ Batman: O Cavaleiro das Trevas',
      descricao: 'Edição definitiva capa dura com extras de arte.',
      imagens: ['https://covers.openlibrary.org/b/id/12673834-L.jpg'],
      categoriaIdentificador: 2,
      categoria: 'Quadrinhos e mangás',
      preco: 139.9,
      estado: 'Usado',
      conservacao: 'Lombada firme, páginas limpas sem anotações',
      estoque: 4,
      disponivel: true,
      vendedor: {
        identificador: 3,
        nome: 'Marina Costa',
        foto: 'https://randomuser.me/api/portraits/women/44.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 6,
      nome: 'Controle Retrô USB Clássico',
      titulo: 'Controle Retrô USB Clássico',
      descricao: 'Compatível com PC e consoles retrô, cabo reforçado de 2m.',
      imagens: [
        'https://images.unsplash.com/photo-1703868671298-b1d776d486f7?auto=format&fit=crop&w=800&h=450&q=80',
      ],
      categoriaIdentificador: 3,
      categoria: 'Jogos',
      preco: 199.0,
      estado: 'Novo',
      conservacao: 'Novo na caixa original',
      estoque: 6,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 7,
      nome: 'Zelda: Ocarina of Time — Edição Especial',
      titulo: 'Zelda: Ocarina of Time — Edição Especial',
      descricao: 'Edição ilustrada de colecionador em excelente estado de conservação.',
      imagens: ['https://covers.openlibrary.org/b/id/8228477-L.jpg'],
      categoriaIdentificador: 3,
      categoria: 'Jogos',
      preco: 279.0,
      estado: 'Usado',
      conservacao: 'Capa preservada e páginas íntegras sem marcas',
      estoque: 1,
      disponivel: true,
      vendedor: {
        identificador: 3,
        nome: 'Marina Costa',
        foto: 'https://randomuser.me/api/portraits/women/44.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 8,
      nome: 'Headset Gamer RGB Profissional',
      titulo: 'Headset Gamer RGB Profissional',
      descricao: 'Som estéreo surround, almofadas macias e iluminação RGB.',
      imagens: [
        'https://images.unsplash.com/photo-1566055972289-c52022ae23b7?auto=format&fit=crop&w=800&h=450&q=80',
      ],
      categoriaIdentificador: 4,
      categoria: 'Acessórios',
      preco: 234.9,
      estado: 'Novo',
      conservacao: 'Lacrado em embalagem original',
      estoque: 15,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 9,
      nome: 'Box Trilogia Mangá Samurai',
      titulo: 'Box Trilogia Mangá Samurai',
      descricao: 'Edição especial de colecionador com arte clássica de samurai.',
      imagens: ['https://covers.openlibrary.org/b/id/863044-L.jpg'],
      categoriaIdentificador: 2,
      categoria: 'Quadrinhos e mangás',
      preco: 164.0,
      estado: 'Novo',
      conservacao: 'Caixa selada sem amassados',
      estoque: 4,
      disponivel: true,
      vendedor: {
        identificador: 3,
        nome: 'Marina Costa',
        foto: 'https://randomuser.me/api/portraits/women/44.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 10,
      nome: 'Dado D20 Colecionável RPG',
      titulo: 'Dado D20 Colecionável RPG',
      descricao: 'Dado poliédrico de 20 faces com acabamento marmorizado e gravação dourada.',
      imagens: [
        'https://images.unsplash.com/photo-1650024520022-cab7611a460b?auto=format&fit=crop&w=800&h=450&q=80',
      ],
      categoriaIdentificador: 3,
      categoria: 'Jogos',
      preco: 118.5,
      estado: 'Novo',
      conservacao: 'Novo, nunca utilizado',
      estoque: 7,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
    {
      identificador: 11,
      nome: 'Miniatura Mecha Edição Esgotada',
      titulo: 'Miniatura Mecha Edição Esgotada',
      descricao: 'Item indisponível usado para validar filtragem do catálogo.',
      imagens: ['https://covers.openlibrary.org/b/id/813630-L.jpg'],
      categoriaIdentificador: 1,
      categoria: 'Figuras colecionáveis',
      preco: 490.0,
      estado: 'Novo',
      conservacao: 'Lacrado',
      estoque: 0,
      disponivel: false,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        media: 5,
        contagem: 1,
      },
    },
  ];

buscarVendedor(identificador: number): PerfilVendedor | null {
    const vendedor = this.vendedores.find(
      vendedor => vendedor.identificador === identificador
    );

    if(!vendedor){
      return null;
    }

    const contagem = vendedor.avaliacoes.length;

    const somaDasNotas = vendedor.avaliacoes.reduce(
      (soma, avaliacao) => soma + avaliacao.nota, 0
    );

    const media = contagem > 0
      ? somaDasNotas / contagem : null;

    return {
      ...vendedor,
      media,
      contagem,
      produtos: this.listarProdutosDoVendedor(identificador)
    };
  }


buscarAnuncio(
  identificadorOuRequest: number | ConsultarAnuncioRequest
): AnuncioResponse | null {
  const identificador =
    typeof identificadorOuRequest === 'number'
      ? identificadorOuRequest
      : identificadorOuRequest.anuncioIdentificador;

  if (!Number.isInteger(identificador) || identificador < 1) {
    return null;
  }

  const anuncio = this.anuncios.find(
    anuncio => anuncio.identificador === identificador
  );

  if (!anuncio) {
    return null;
  }

  const vendedor = this.buscarVendedor(
    anuncio.vendedor.identificador
  );

  if (!vendedor) {
    return null;
  }

  return {
    ...anuncio,
    disponivel: anuncio.disponivel ?? anuncio.estoque > 0,
    vendedor
  };
}

listarCategorias(): CategoriaResponse[] {
  return CATEGORIAS_CATALOGO.map(categoria => ({ ...categoria }));
}

consultarAnuncios(
  request: ConsultarAnunciosRequest = {}
): ConsultarAnunciosResponse {
  const termo = request.termo?.trim().toLowerCase() ?? '';
  const categoriaIdentificador = request.categoriaIdentificador;
  const itensPorPagina =
    request.itensPorPagina &&
    Number.isInteger(request.itensPorPagina) &&
    request.itensPorPagina > 0
      ? request.itensPorPagina
      : 8;

  const filtrados = this.anuncios.filter(anuncio => {
    if (anuncio.disponivel === false || anuncio.estoque <= 0) {
      return false;
    }

    if (
      categoriaIdentificador !== undefined &&
      anuncio.categoriaIdentificador !== categoriaIdentificador
    ) {
      return false;
    }

    if (termo) {
      const corresponde =
        anuncio.nome.toLowerCase().includes(termo) ||
        anuncio.titulo.toLowerCase().includes(termo) ||
        anuncio.categoria.toLowerCase().includes(termo);

      if (!corresponde) {
        return false;
      }
    }

    return true;
  });

  const total = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));
  const paginaSolicitada =
    request.pagina && Number.isInteger(request.pagina) && request.pagina >= 1
      ? request.pagina
      : 1;
  const pagina = Math.min(paginaSolicitada, totalPaginas);
  const inicio = (pagina - 1) * itensPorPagina;

  return {
    anuncios: filtrados.slice(inicio, inicio + itensPorPagina),
    pagina,
    itensPorPagina,
    total,
  };
}

listarAnuncios(): AnuncioResponse[] {
  return this.anuncios;
}

listarProdutosDoVendedor(identificador: number) {
  return this.anuncios
    .filter(
      anuncio =>
        anuncio.vendedor.identificador === identificador &&
        anuncio.disponivel !== false &&
        anuncio.estoque > 0
    )
    
    .map(anuncio => ({
      identificador: anuncio.identificador,
      nome: anuncio.nome,
      preco: anuncio.preco,
      imagem: anuncio.imagens[0] ?? ''
    }));
}

quantidadeValida(quantidade: number, estoque: number): boolean {
  return Number.isInteger(quantidade)
    && quantidade >= 1
    && quantidade <= estoque;
}

calcularSubtotalEmCentavos(precoUnitario: number, quantidade: number): number {
  return Math.round(precoUnitario * 100) * quantidade;
}

consultarCarrinho(compradorIdentificador: number): CarrinhoResponse {
  if (!Number.isInteger(compradorIdentificador) || compradorIdentificador < 1) {
    return {
      compradorIdentificador,
      itens: [],
      total: 0,
    };
  }

  const armazenados = this.carrinhos.get(compradorIdentificador) ?? [];

  return this.montarCarrinhoResponse(compradorIdentificador, armazenados);
}

adicionarAoCarrinho(
  request: AdicionarAoCarrinhoRequest
): ResultadoOperacaoCarrinho {
  const { compradorIdentificador, anuncioIdentificador, quantidade } = request;
  const carrinhoAtual = this.consultarCarrinho(compradorIdentificador);

  if (!Number.isInteger(compradorIdentificador) || compradorIdentificador < 1) {
    return {
      sucesso: false,
      mensagem: 'Comprador inválido.',
      carrinho: carrinhoAtual,
    };
  }

  const listaAtual = (this.carrinhos.get(compradorIdentificador) ?? []).map(
    item => ({ ...item })
  );
  const existente = listaAtual.find(
    item => item.anuncioIdentificador === anuncioIdentificador
  );
  const anuncioCatalogo = this.buscarAnuncio(anuncioIdentificador);

  const nome = request.nome ?? existente?.nome ?? anuncioCatalogo?.nome ?? '';
  const imagem =
    request.imagem ??
    existente?.imagem ??
    anuncioCatalogo?.imagens[0] ??
    '';
  const precoUnitario =
    request.precoUnitario ??
    existente?.precoUnitario ??
    anuncioCatalogo?.preco;
  const estoqueDisponivel =
    request.estoqueDisponivel ??
    existente?.estoqueDisponivel ??
    anuncioCatalogo?.estoque ??
    0;
  const disponivel =
    request.disponivel ??
    existente?.disponivel ??
    (anuncioCatalogo
      ? anuncioCatalogo.disponivel !== false && anuncioCatalogo.estoque > 0
      : false);

  if (
    !nome.trim() ||
    typeof precoUnitario !== 'number' ||
    !Number.isFinite(precoUnitario) ||
    precoUnitario < 0
  ) {
    return {
      sucesso: false,
      mensagem: 'Não foi possível localizar os dados do anúncio.',
      carrinho: carrinhoAtual,
    };
  }

  const erroQuantidade = this.validarQuantidadeEStatus(
    quantidade,
    disponivel,
    estoqueDisponivel
  );

  if (erroQuantidade) {
    return {
      sucesso: false,
      mensagem: erroQuantidade,
      carrinho: carrinhoAtual,
    };
  }

  const novaQuantidade = (existente?.quantidade ?? 0) + quantidade;

  if (novaQuantidade > estoqueDisponivel) {
    return {
      sucesso: false,
      mensagem: `Quantidade solicitada excede o estoque disponível (${estoqueDisponivel}).`,
      carrinho: carrinhoAtual,
    };
  }

  if (existente) {
    existente.nome = nome;
    existente.imagem = imagem;
    existente.precoUnitario = precoUnitario;
    existente.quantidade = novaQuantidade;
    existente.disponivel = disponivel;
    existente.estoqueDisponivel = estoqueDisponivel;
  } else {
    listaAtual.push({
      anuncioIdentificador,
      nome,
      imagem,
      precoUnitario,
      quantidade,
      disponivel,
      estoqueDisponivel,
    });
  }

  this.carrinhos.set(compradorIdentificador, listaAtual);
  this.salvarCarrinhos();

  return {
    sucesso: true,
    mensagem: 'Produto adicionado ao carrinho.',
    carrinho: this.montarCarrinhoResponse(compradorIdentificador, listaAtual),
  };
}

alterarQuantidadeCarrinho(
  request: AlterarQuantidadeRequest
): ResultadoOperacaoCarrinho {
  const { compradorIdentificador, anuncioIdentificador, quantidade } = request;
  const carrinhoAtual = this.consultarCarrinho(compradorIdentificador);

  const listaAtual = (this.carrinhos.get(compradorIdentificador) ?? []).map(
    item => ({ ...item })
  );
  const existente = listaAtual.find(
    item => item.anuncioIdentificador === anuncioIdentificador
  );

  if (!existente) {
    return {
      sucesso: false,
      mensagem: 'Item não encontrado no carrinho.',
      carrinho: carrinhoAtual,
    };
  }

  const erro = this.validarQuantidadeEStatus(
    quantidade,
    existente.disponivel,
    existente.estoqueDisponivel
  );

  if (erro) {
    return {
      sucesso: false,
      mensagem: erro,
      carrinho: carrinhoAtual,
    };
  }

  existente.quantidade = quantidade;
  this.carrinhos.set(compradorIdentificador, listaAtual);
  this.salvarCarrinhos();

  return {
    sucesso: true,
    mensagem: '',
    carrinho: this.montarCarrinhoResponse(compradorIdentificador, listaAtual),
  };
}

removerDoCarrinho(
  request: RemoverDoCarrinhoRequest
): ResultadoOperacaoCarrinho {
  const { compradorIdentificador, anuncioIdentificador } = request;
  const listaAtual = this.carrinhos.get(compradorIdentificador) ?? [];
  const filtrada = listaAtual
    .filter(item => item.anuncioIdentificador !== anuncioIdentificador)
    .map(item => ({ ...item }));

  if (filtrada.length !== listaAtual.length) {
    this.carrinhos.set(compradorIdentificador, filtrada);
    this.salvarCarrinhos();
  }

  return {
    sucesso: true,
    mensagem: '',
    carrinho: this.montarCarrinhoResponse(compradorIdentificador, filtrada),
  };
}

limparCarrinho(compradorIdentificador: number): ResultadoOperacaoCarrinho {
  if (!Number.isInteger(compradorIdentificador) || compradorIdentificador < 1) {
    return {
      sucesso: false,
      mensagem: 'Comprador inválido.',
      carrinho: this.consultarCarrinho(compradorIdentificador),
    };
  }

  if ((this.carrinhos.get(compradorIdentificador) ?? []).length > 0) {
    this.carrinhos.set(compradorIdentificador, []);
    this.salvarCarrinhos();
  }

  return {
    sucesso: true,
    mensagem: '',
    carrinho: this.montarCarrinhoResponse(compradorIdentificador, []),
  };
}

atualizarDisponibilidadeCarrinho(
  compradorIdentificador: number,
  anuncioIdentificador: number,
  disponivel: boolean,
  estoqueDisponivel?: number
): CarrinhoResponse {
  const listaAtual = (this.carrinhos.get(compradorIdentificador) ?? []).map(
    item =>
      item.anuncioIdentificador === anuncioIdentificador
        ? {
            ...item,
            disponivel,
            estoqueDisponivel:
              estoqueDisponivel !== undefined
                ? estoqueDisponivel
                : item.estoqueDisponivel,
          }
        : { ...item }
  );

  this.carrinhos.set(compradorIdentificador, listaAtual);
  this.salvarCarrinhos();

  return this.montarCarrinhoResponse(compradorIdentificador, listaAtual);
}

private validarQuantidadeEStatus(
  quantidade: number,
  disponivel: boolean,
  estoqueDisponivel: number
): string | null {
  if (!disponivel || estoqueDisponivel < 1) {
    return 'Este anúncio está indisponível no momento. Remova-o para continuar.';
  }

  if (
    typeof quantidade !== 'number' ||
    !Number.isFinite(quantidade) ||
    !Number.isInteger(quantidade) ||
    quantidade < 1
  ) {
    return 'Informe uma quantidade inteira maior que zero.';
  }

  if (quantidade > estoqueDisponivel) {
    return `Quantidade solicitada excede o estoque disponível (${estoqueDisponivel}).`;
  }

  return null;
}

private montarCarrinhoResponse(
  compradorIdentificador: number,
  armazenados: readonly ItemCarrinhoArmazenado[]
): CarrinhoResponse {
  const itens: ItemCarrinhoResponse[] = armazenados.map(item => ({
    ...item,
    subtotal:
      this.calcularSubtotalEmCentavos(item.precoUnitario, item.quantidade) /
      100,
  }));

  const totalEmCentavos = itens.reduce(
    (acumulador, item) =>
      acumulador +
      this.calcularSubtotalEmCentavos(item.precoUnitario, item.quantidade),
    0
  );

  return {
    compradorIdentificador,
    itens,
    total: totalEmCentavos / 100,
  };
}

private carregarCarrinhos(): Map<number, ItemCarrinhoArmazenado[]> {
  const mapaPadrao = new Map<number, ItemCarrinhoArmazenado[]>([
    [1, ITENS_CARRINHO_PADRAO.map(item => ({ ...item }))],
  ]);

  if (typeof localStorage === 'undefined') {
    return mapaPadrao;
  }

  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHOS_STORAGE);
    if (salvo === null) {
      return mapaPadrao;
    }

    const dados: unknown = JSON.parse(salvo);
    if (typeof dados !== 'object' || dados === null || Array.isArray(dados)) {
      return mapaPadrao;
    }

    const mapaCarregado = new Map<number, ItemCarrinhoArmazenado[]>();

    for (const [chave, lista] of Object.entries(
      dados as Record<string, unknown>
    )) {
      const compradorId = Number(chave);

      if (!Number.isInteger(compradorId) || compradorId < 1 || !Array.isArray(lista)) {
        continue;
      }

      const itensValidos = lista.filter(
        (item): item is ItemCarrinhoArmazenado =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as ItemCarrinhoArmazenado).anuncioIdentificador ===
            'number' &&
          typeof (item as ItemCarrinhoArmazenado).nome === 'string' &&
          typeof (item as ItemCarrinhoArmazenado).imagem === 'string' &&
          typeof (item as ItemCarrinhoArmazenado).precoUnitario === 'number' &&
          typeof (item as ItemCarrinhoArmazenado).quantidade === 'number' &&
          typeof (item as ItemCarrinhoArmazenado).disponivel === 'boolean' &&
          typeof (item as ItemCarrinhoArmazenado).estoqueDisponivel === 'number'
      );

      mapaCarregado.set(
        compradorId,
        itensValidos.map(item => ({ ...item }))
      );
    }

    return mapaCarregado;
  } catch {
    return mapaPadrao;
  }
}

private salvarCarrinhos(): void {
  this.versaoCarrinhos.update(versao => versao + 1);

  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const objeto: Record<number, ItemCarrinhoArmazenado[]> = {};

    for (const [compradorIdentificador, itens] of this.carrinhos.entries()) {
      objeto[compradorIdentificador] = itens;
    }

    localStorage.setItem(CHAVE_CARRINHOS_STORAGE, JSON.stringify(objeto));
  } catch {
    // Ignora indisponibilidade de storage no ambiente atual.
  }
}

private readonly pedidos: PedidoResponse[] = this.carregarPedidos();

criarPedido(compradorIdentificador: number): ResultadoOperacaoPedido {
  const comprador = this.usuarios.find(
    usuario => usuario.identificador === compradorIdentificador
  );

  if (!comprador) {
    return { sucesso: false, mensagem: 'Comprador inválido.', pedido: null };
  }

  const carrinho = this.consultarCarrinho(compradorIdentificador);

  if (carrinho.itens.length === 0) {
    return { sucesso: false, mensagem: 'Seu carrinho está vazio.', pedido: null };
  }

  const possuiPendencia = carrinho.itens.some(
    item =>
      !item.disponivel ||
      !this.quantidadeValida(item.quantidade, item.estoqueDisponivel)
  );

  if (possuiPendencia) {
    return {
      sucesso: false,
      mensagem: 'Corrija ou remova os itens indisponíveis antes de confirmar o pedido.',
      pedido: null,
    };
  }

  const agora = this.dataHoraAtual();
  const identificador =
    this.pedidos.reduce((maior, pedido) => Math.max(maior, pedido.identificador), 1000) + 1;

  const pedido: PedidoResponse = {
    identificador,
    compradorIdentificador,
    compradorNome: comprador.nome,
    compradorEmail: comprador.email,
    itens: carrinho.itens.map(item => ({
      anuncioIdentificador: item.anuncioIdentificador,
      vendedorIdentificador:
        this.anuncios.find(anuncio => anuncio.identificador === item.anuncioIdentificador)
          ?.vendedor.identificador ?? 0,
      nomeProduto: item.nome,
      imagemProduto: item.imagem,
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
      subtotal: item.subtotal,
    })),
    valorTotal: carrinho.total,
    estado: 'CRIADO',
    historico: [{ estado: 'CRIADO', ocorridoEm: agora }],
    avaliado: false,
    criadoEm: agora,
  };

  this.pedidos.push(pedido);
  this.salvarPedidos();

  this.carrinhos.set(compradorIdentificador, []);
  this.salvarCarrinhos();

  return {
    sucesso: true,
    mensagem: 'Pedido criado com sucesso.',
    pedido: this.copiarPedido(pedido),
  };
}

listarCompras(request: ListarComprasRequest): ListarComprasResponse {
  const itensPorPagina =
    request.itensPorPagina &&
    Number.isInteger(request.itensPorPagina) &&
    request.itensPorPagina > 0
      ? request.itensPorPagina
      : 10;

  const filtrados = this.pedidos
    .filter(
      pedido =>
        pedido.compradorIdentificador === request.compradorIdentificador &&
        (request.estado === undefined || pedido.estado === request.estado)
    )
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const total = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / itensPorPagina));
  const paginaSolicitada =
    request.pagina && Number.isInteger(request.pagina) && request.pagina >= 1
      ? request.pagina
      : 1;
  const pagina = Math.min(paginaSolicitada, totalPaginas);
  const inicio = (pagina - 1) * itensPorPagina;

  return {
    compras: filtrados.slice(inicio, inicio + itensPorPagina).map(pedido => ({
      identificador: pedido.identificador,
      valorTotal: pedido.valorTotal,
      estado: pedido.estado,
      avaliado: pedido.avaliado,
      quantidadeItens: pedido.itens.reduce((soma, item) => soma + item.quantidade, 0),
      imagem: pedido.itens[0]?.imagemProduto ?? '',
      criadoEm: pedido.criadoEm,
    })),
    pagina,
    itensPorPagina,
    total,
  };
}

detalharPedido(
  compradorIdentificador: number,
  pedidoIdentificador: number
): PedidoResponse | null {
  const pedido = this.pedidos.find(
    item =>
      item.identificador === pedidoIdentificador &&
      item.compradorIdentificador === compradorIdentificador
  );

  return pedido ? this.copiarPedido(pedido) : null;
}

avaliarPedido(request: AvaliarPedidoRequest): ResultadoOperacaoPedido {
  const pedido = this.pedidos.find(
    item =>
      item.identificador === request.pedidoIdentificador &&
      item.compradorIdentificador === request.compradorIdentificador
  );

  if (!pedido) {
    return { sucesso: false, mensagem: 'Pedido não encontrado.', pedido: null };
  }

  if (pedido.estado !== 'CONCLUIDO') {
    return {
      sucesso: false,
      mensagem: 'Somente pedidos concluídos podem ser avaliados.',
      pedido: this.copiarPedido(pedido),
    };
  }

  if (pedido.avaliado) {
    return {
      sucesso: false,
      mensagem: 'Este pedido já foi avaliado.',
      pedido: this.copiarPedido(pedido),
    };
  }

  if (!Number.isInteger(request.nota) || request.nota < 1 || request.nota > 5) {
    return {
      sucesso: false,
      mensagem: 'Informe uma nota de 1 a 5.',
      pedido: this.copiarPedido(pedido),
    };
  }

  const comentario = request.comentario?.trim() ?? '';
  if (comentario.length > 1000) {
    return {
      sucesso: false,
      mensagem: 'O comentário deve ter no máximo 1000 caracteres.',
      pedido: this.copiarPedido(pedido),
    };
  }

  const data = new Date().toLocaleDateString('pt-BR');
  const vendedoresAvaliados = new Set(pedido.itens.map(item => item.vendedorIdentificador));

  for (const vendedorIdentificador of vendedoresAvaliados) {
    const vendedor = this.vendedores.find(
      item => item.identificador === vendedorIdentificador
    );

    if (!vendedor) {
      continue;
    }

    const proximoIdentificador =
      this.vendedores
        .flatMap(item => item.avaliacoes)
        .reduce((maior, avaliacao) => Math.max(maior, avaliacao.identificador), 0) + 1;

    vendedor.avaliacoes.unshift({
      identificador: proximoIdentificador,
      autor: pedido.compradorNome,
      nota: request.nota,
      comentario,
      data,
    });
  }

  pedido.avaliado = true;
  this.salvarPedidos();

  return {
    sucesso: true,
    mensagem: 'Avaliação enviada. Obrigado!',
    pedido: this.copiarPedido(pedido),
  };
}

private copiarPedido(pedido: PedidoResponse): PedidoResponse {
  return {
    ...pedido,
    itens: pedido.itens.map(item => ({ ...item })),
    historico: pedido.historico.map(evento => ({ ...evento })),
  };
}

private dataHoraAtual(): string {
  const agora = new Date();
  const deslocamento = agora.getTimezoneOffset() * 60000;
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 19);
}

private carregarPedidos(): PedidoResponse[] {
  const padrao = PEDIDOS_PADRAO.map(pedido => this.copiarPedido(pedido));

  if (typeof localStorage === 'undefined') {
    return padrao;
  }

  try {
    const salvo = localStorage.getItem(CHAVE_PEDIDOS_STORAGE);
    if (salvo === null) {
      return padrao;
    }

    const dados: unknown = JSON.parse(salvo);
    if (!Array.isArray(dados)) {
      return padrao;
    }

    return dados
      .filter(
        (item): item is PedidoResponse =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as PedidoResponse).identificador === 'number' &&
          typeof (item as PedidoResponse).compradorIdentificador === 'number' &&
          Array.isArray((item as PedidoResponse).itens) &&
          Array.isArray((item as PedidoResponse).historico) &&
          ESTADOS_PEDIDO.includes((item as PedidoResponse).estado) &&
          typeof (item as PedidoResponse).valorTotal === 'number' &&
          typeof (item as PedidoResponse).criadoEm === 'string'
      )
      .map(pedido => this.copiarPedido(pedido));
  } catch {
    return padrao;
  }
}

private salvarPedidos(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CHAVE_PEDIDOS_STORAGE, JSON.stringify(this.pedidos));
  } catch {
    // Ignora indisponibilidade de storage no ambiente atual.
  }
}

}
