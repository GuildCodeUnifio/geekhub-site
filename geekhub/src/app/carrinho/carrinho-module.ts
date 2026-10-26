import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarrinhoRoutingModule } from './carrinho-routing-module';
import { CarrinhoComponente } from './carrinho/carrinho.componente';

@NgModule({
  declarations: [CarrinhoComponente],
  imports: [CommonModule, CarrinhoRoutingModule],
})
export class CarrinhoModule {}
