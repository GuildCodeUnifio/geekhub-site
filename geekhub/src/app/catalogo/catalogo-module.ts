import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogoRoutingModule } from './catalogo-routing-module';
import { CatalogoComponente } from './catalogo/catalogo.componente';

@NgModule({
  declarations: [CatalogoComponente],
  imports: [CommonModule, CatalogoRoutingModule],
})
export class CatalogoModule {}
