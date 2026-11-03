import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidosRoutingModule } from './pedidos-routing-module';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';
import { DetalhesPedidoComponente } from './detalhes-pedido/detalhes-pedido.componente';

@NgModule({
  declarations: [RevisarPedidoComponente, MinhasComprasComponente, DetalhesPedidoComponente],
  imports: [CommonModule, PedidosRoutingModule],
})
export class PedidosModule {}
