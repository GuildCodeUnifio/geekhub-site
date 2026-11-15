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

  usuarioAtual: UsuarioResponse | null = this.carregarUsuarioAtual();

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

}
