import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import type { EntrarRequest } from './autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

export interface ContaUsuario extends UsuarioResponse {
  senha: string;
}

export interface CadastrarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
}

const CHAVE_USUARIOS_STORAGE = 'geekhub.usuarios';
const CHAVE_USUARIO_ATUAL_STORAGE = 'geekhub.usuarioAtual';
const CHAVE_CARRINHOS_STORAGE = 'geekhub.carrinhos';

export interface ItemCarrinhoResponse {
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
  taxaResposta: number;
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

export interface AnuncioResponse{
  identificador: number;
  nome: string;
  titulo: string;
  descricao: string;
  imagens: string[];
  categoria: string;
  preco: number;
  estado: 'Novo' | 'Usado';
  conservacao: string;
  estoque: number,
  vendedor: VendedorResponse;
}

export interface VendedorResponse{
  identificador: number;
  nome: string;
  foto?: string;
  media: number | null;
  contagem: number;
}

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

  get usuarioAtual(): UsuarioResponse | null {
    return this.usuarioAtualSinal();
  }

  set usuarioAtual(usuario: UsuarioResponse | null) {
    this.usuarioAtualSinal.set(usuario);
  }

  get versaoEstadoCarrinhos(): number {
    return this.versaoCarrinhos();
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

  sair(): void {
    this.usuarioAtual = null;
    this.salvarUsuarioAtual();
    void this.roteador.navigate(['/entrar']);
  }

  encerrarSessao(): void {
    this.sair();
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

      return contas.length > 0 ? contas : padrao;
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
  >[]= [
    {
      identificador: 2,
      nome: 'Luiz Carlos Oliveira',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
      membroDesde: 2024,
      vendas: 1,
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
    categoria: 'Colecionavel',
    preco: 1850.00,
    estado: 'Novo',
    conservacao: 'Estado do lacre original, sem arranhados e amaçados',
    estoque: 3,
    vendedor: {
      identificador: 2,
      nome: "Luiz Carlos Oliveira",
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
      media: 5,
      contagem: 1
    } 
  }
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


buscarAnuncio(identificador: number): AnuncioResponse | null {
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
    vendedor
  };
}

listarAnuncios(): AnuncioResponse[] {
  return this.anuncios;
}

listarProdutosDoVendedor(identificador: number) {
  return this.anuncios
    .filter(
      anuncio => anuncio.vendedor.identificador === identificador
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
    (anuncioCatalogo ? anuncioCatalogo.estoque > 0 : false);

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

}
