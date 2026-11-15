import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import type { EntrarRequest } from './autenticacao/entrar/entrar.componente';
import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

export interface ContaUsuario extends UsuarioResponse {
  senha: string;
}

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

  private readonly usuarios: ContaUsuario[] = [
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

  usuarioAtual: UsuarioResponse | null = null;

  constructor(private readonly roteador: Router) {}

  get versaoCabecalho(): 'Simples' | 'Completa' {
    const caminho = this.roteador.url.split('?')[0];

    return caminho === '/entrar' ||
      caminho === '/cadastro' ||
      caminho.startsWith('/autenticacao/')
      ? 'Simples'
      : 'Completa';
  }

  entrar(request: EntrarRequest): UsuarioResponse | null {
    const email = request.email.trim().toLowerCase();

    const conta = this.usuarios.find(
      usuario =>
        usuario.email === email &&
        usuario.senha === request.senha
    );

    if (!conta) {
      this.usuarioAtual = null;
      return null;
    }

    this.usuarioAtual = {
      identificador: conta.identificador,
      nome: conta.nome,
      email: conta.email,
      ...(conta.foto ? { foto: conta.foto } : {}),
    };

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
    void this.roteador.navigate(['/entrar']);
  }

  encerrarSessao(): void {
    this.sair();
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
