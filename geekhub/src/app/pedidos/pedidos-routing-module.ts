import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MinhasComprasComponente } from './minhas-compras/minhas-compras.componente';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';

const routes: Routes = [
  {
    path: 'revisar',
    component: RevisarPedidoComponente,
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
