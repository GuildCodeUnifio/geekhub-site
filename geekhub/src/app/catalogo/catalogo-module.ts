import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';

import { CartaoProdutoComponente } from './cartao-produto/cartao-produto.componente';
import { CatalogoRoutingModule } from './catalogo-routing-module';
import { CatalogoComponente } from './catalogo/catalogo.componente';
import { DetalhesProdutoComponente } from './detalhes-produto/detalhes-produto.componente';

registerLocaleData(localePt, 'pt-BR');

export function criarPaginadorPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (pagina: number, tamanhoPagina: number, total: number): string => {
    if (total === 0 || tamanhoPagina === 0) {
      return `0 de ${total}`;
    }

    const inicio = pagina * tamanhoPagina + 1;
    const fim = Math.min((pagina + 1) * tamanhoPagina, total);
    return `${inicio} – ${fim} de ${total}`;
  };

  return intl;
}

@NgModule({
  declarations: [CatalogoComponente, CartaoProdutoComponente, DetalhesProdutoComponente],
  imports: [
    CommonModule,
    CatalogoRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  exports: [CartaoProdutoComponente],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useFactory: criarPaginadorPtBr },
  ],
})
export class CatalogoModule {}
