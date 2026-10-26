import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidosRoutingModule } from './pedidos-routing-module';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';

@NgModule({
  declarations: [RevisarPedidoComponente, MinhasComprasComponente],
  imports: [CommonModule, PedidosRoutingModule],
})
export class PedidosModule {}
