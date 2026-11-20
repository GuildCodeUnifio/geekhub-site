import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalhesPedidoComponente } from './detalhes-pedido/detalhes-pedido.componente';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';
import { MinhasVendasComponente } from './minhas-vendas/minhas-vendas.componente';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';

const routes: Routes = [
  {
    path: 'revisar',
    component: RevisarPedidoComponente,
  },
  {
    path: 'vendas',
    component: MinhasVendasComponente,
  },
  {
    path: ':id',
    component: DetalhesPedidoComponente,
  },
  {
    path: '',
    component: MinhasComprasComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidosRoutingModule {}
