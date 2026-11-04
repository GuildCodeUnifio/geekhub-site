import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';


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
  selector: 'app-detalhes-produto',
  standalone: false,
  styleUrl: './detalhes-produto.componente.scss',
  templateUrl: './detalhes-produto.componente.html',
})

export class DetalhesProdutoComponente {
  private readonly route = inject(ActivatedRoute);

  imagemSelecionada = 0;

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
      media: 4.1,
      contagem: 12
    }
  }
];
readonly anuncio$ = this.route.paramMap.pipe(
  map(parametros => {
    
    this.imagemSelecionada = 0;

    const identificador = parametros.get('identificador');

    if (identificador === null) {
      return undefined;
    }

    return this.anuncios.find(
      anuncio => anuncio.identificador === Number(identificador)
    );
  })
);
}
