import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';

import { criarPaginadorPtBr } from '../catalogo/catalogo-module';
import { PedidosRoutingModule } from './pedidos-routing-module';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';
import { DetalhesPedidoComponente } from './detalhes-pedido/detalhes-pedido.componente';

@NgModule({
  declarations: [RevisarPedidoComponente, MinhasComprasComponente, DetalhesPedidoComponente],
  imports: [
    CommonModule,
    FormsModule,
    PedidosRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: criarPaginadorPtBr }],
})
export class PedidosModule {}
