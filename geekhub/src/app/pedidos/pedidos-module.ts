import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { criarPaginadorPtBr } from '../catalogo/catalogo-module';
import { PedidosRoutingModule } from './pedidos-routing-module';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';
import { MinhasVendasComponente } from './minhas-vendas/minhas-vendas.componente';
import { DetalhesPedidoComponente } from './detalhes-pedido/detalhes-pedido.componente';

@NgModule({
  declarations: [
    RevisarPedidoComponente,
    MinhasComprasComponente,
    MinhasVendasComponente,
    DetalhesPedidoComponente,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PedidosRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatSlideToggleModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: criarPaginadorPtBr }],
})
export class PedidosModule {}
