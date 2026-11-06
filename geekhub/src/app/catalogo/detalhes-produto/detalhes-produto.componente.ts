import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { App, type AnuncioResponse } from '../../app';

@Component({
  selector: 'app-detalhes-produto',
  standalone: false,
  styleUrl: './detalhes-produto.componente.scss',
  templateUrl: './detalhes-produto.componente.html',
})

export class DetalhesProdutoComponente {
  private readonly route = inject(ActivatedRoute);
  private readonly app = inject(App);

  imagemSelecionada = 0;

  readonly anuncio$ = this.route.paramMap.pipe(
    map(parametros => {
      this.imagemSelecionada = 0;

      const identificador = parametros.get('identificador');

      if (identificador === null) {
        return undefined;
      }

      return this.app.buscarAnuncio(Number(identificador));
    })
  );
}
