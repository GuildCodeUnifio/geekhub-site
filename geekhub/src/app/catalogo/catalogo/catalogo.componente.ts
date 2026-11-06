import { Component, inject } from '@angular/core';
import { App } from '../../app';

@Component({
  selector: 'app-catalogo',
  standalone: false,
  styleUrl: './catalogo.componente.scss',
  templateUrl: './catalogo.componente.html',
})

export class CatalogoComponente {
  private readonly app =  inject(App);

  readonly anuncios = this.app.listarAnuncios();
}
