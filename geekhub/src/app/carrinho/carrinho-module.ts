import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CarrinhoComponente } from './carrinho/carrinho.componente';
import { CarrinhoRoutingModule } from './carrinho-routing-module';

@NgModule({
  declarations: [CarrinhoComponente],
  imports: [
    CommonModule,
    FormsModule,
    CarrinhoRoutingModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class CarrinhoModule {}
