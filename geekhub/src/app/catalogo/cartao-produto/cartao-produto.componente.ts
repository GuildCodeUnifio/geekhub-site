import { Component, Input } from '@angular/core';

import type { AnuncioResponse } from '../../app';

@Component({
  selector: 'app-cartao-produto',
  standalone: false,
  styleUrl: './cartao-produto.componente.scss',
  templateUrl: './cartao-produto.componente.html',
})
export class CartaoProdutoComponente {
  @Input({ required: true }) anuncio!: AnuncioResponse;
}
