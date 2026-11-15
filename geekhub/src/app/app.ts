
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  signal,
} from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import type { UsuarioResponse } from './cabecalho/cabecalho/cabecalho';

interface ComponenteComLogin {
  loginRealizado: EventEmitter<UsuarioResponse>;
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
export class App implements OnDestroy {
  protected readonly title = signal('geekhub');

  // Visitante inicia sem sessão simulada
  usuarioAtual: UsuarioResponse | null = null;

  private assinaturaLogin?: Subscription;

  constructor(
    private readonly roteador: Router,
    private readonly detector: ChangeDetectorRef,
  ) { }

  // Define qual versão do cabeçalho será exibida
  get versaoCabecalho(): 'Simples' | 'Completa' {
    const caminho = this.roteador.url.split('?')[0];

    return caminho === '/entrar' ||
      caminho === '/cadastro' ||
      caminho.startsWith('/autenticacao/')
      ? 'Simples'
      : 'Completa';
  }

  // Recebe a instância do componente carregado na rota
  aoAtivarRota(componente: unknown): void {
    this.aoDesativarRota();

    if (this.possuiEventoLogin(componente)) {
      this.assinaturaLogin =
        componente.loginRealizado.subscribe((usuario) => {
          this.usuarioAtual = usuario;
          this.detector.markForCheck();
        });
    }
  }

  // Encerra a inscrição quando a tela é destruída
  aoDesativarRota(): void {
    this.assinaturaLogin?.unsubscribe();
    this.assinaturaLogin = undefined;
  }

  // Confere se o componente possui o evento de login
  private possuiEventoLogin(
    componente: unknown
  ): componente is ComponenteComLogin {
    return (
      typeof componente === 'object' &&
      componente !== null &&
      'loginRealizado' in componente &&
      componente.loginRealizado instanceof EventEmitter
    );
  }

  // Navegação de pesquisa do cabeçalho
  pesquisar(termo: string): void {
    void this.roteador.navigate(['/'], {
      queryParams: {
        busca: termo || null
      },
    });
  }

  // Subtask #36: encerrar sessão
  sair(): void {
    this.usuarioAtual = null;
    this.detector.markForCheck();

    void this.roteador.navigate(['/entrar']);
  }

  ngOnDestroy(): void {
    this.aoDesativarRota();
  }

  private readonly vendedores: Omit< 
    PerfilVendedor, 
    'media' | 'contagem'
  >[]= [
    {
      identificador: 2,
      nome: 'Luiz Carlos Oliveira',
      foto: 'imagens/vendedores/vendedor.jpg',
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
    imagens: ['imagens/produtos/naruto.jpg', 'imagens/produtos/n1.jpg', 'imagens/produtos/n2.jpg', 'imagens/produtos/n3.jpg'],
    categoria: 'Colecionavel',
    preco: 1850.00,
    estado: 'Novo',
    conservacao: 'Estado do lacre original, sem arranhados e amaçados',
    estoque: 3,
    vendedor: {
      identificador: 2,
      nome: "Luiz Carlos Oliveira",
      foto: 'imagens/vendedores/vendedor.jpg',
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
