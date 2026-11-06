import { Component, signal } from '@angular/core';

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

  private readonly vendedores: PerfilVendedor[] = [
    {
      identificador: 2,
      nome: 'Luiz Carlos Oliveira',
      foto: 'imagens/vendedores/vendedor.jpg',
      media: 5,
      contagem: 1,
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
    estoque: 1,
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

    return {
      ...vendedor,
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


}
