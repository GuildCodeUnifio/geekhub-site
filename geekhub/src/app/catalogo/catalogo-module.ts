import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogoRoutingModule } from './catalogo-routing-module';
import { CatalogoComponente } from './catalogo/catalogo.componente';
import { DetalhesProdutoComponente } from './detalhes-produto/detalhes-produto.componente';

@NgModule({
  declarations: [CatalogoComponente, DetalhesProdutoComponente],
  imports: [CommonModule, CatalogoRoutingModule],
})
export class CatalogoModule {}
