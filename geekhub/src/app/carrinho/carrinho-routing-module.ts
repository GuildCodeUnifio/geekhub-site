import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarrinhoComponente } from './carrinho/carrinho.componente';

const routes: Routes = [
  {
    path: '',
    component: CarrinhoComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarrinhoRoutingModule {}
