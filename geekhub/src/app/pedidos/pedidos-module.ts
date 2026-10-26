import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidosRoutingModule } from './pedidos-routing-module';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';

@NgModule({
  declarations: [RevisarPedidoComponente],
  imports: [CommonModule, PedidosRoutingModule],
})
export class PedidosModule {}
