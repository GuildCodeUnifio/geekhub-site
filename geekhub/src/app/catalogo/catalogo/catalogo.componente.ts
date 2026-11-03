import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogo',
  standalone: false,
  styleUrl: './catalogo.componente.scss',
  templateUrl: './catalogo.componente.html',
})
export class CatalogoComponente {
  anuncio = {
    identificador: 1,
    nome: 'Action figure Naruto',
    preco: 1850,
    imagens: ['imagens/produtos/naruto.jpg']
  };
}
