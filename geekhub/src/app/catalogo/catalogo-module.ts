import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CabecalhoModule } from '../cabecalho/cabecalho-module';

import { CatalogoRoutingModule } from './catalogo-routing-module';
import { CatalogoComponente } from './catalogo/catalogo.componente';
import { DetalhesProdutoComponente } from './detalhes-produto/detalhes-produto.componente';

@NgModule({
  declarations: [CatalogoComponente, DetalhesProdutoComponente],
  imports: [CommonModule, CatalogoRoutingModule, MatButtonModule, MatCardModule, MatIconModule, CabecalhoModule],
})
export class CatalogoModule {}
