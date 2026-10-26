import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevisarPedidoComponente } from './revisar-pedido/revisar-pedido.componente';

const routes: Routes = [
  {
    path: 'revisar',
    component: RevisarPedidoComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidosRoutingModule {}
