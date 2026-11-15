import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { CarrinhoRoutingModule } from './carrinho-routing-module';
import { CarrinhoComponente } from './carrinho/carrinho.componente';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [CarrinhoComponente],
  imports: [
    CommonModule,
    CarrinhoRoutingModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
})
export class CarrinhoModule {}
