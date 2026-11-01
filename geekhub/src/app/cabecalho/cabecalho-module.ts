import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CabecalhoRoutingModule } from './cabecalho-routing-module';
import { CabecalhoSimples } from './cabecalho-simples/cabecalho-simples';

@NgModule({
  declarations: [CabecalhoSimples],
  imports: [CommonModule, CabecalhoRoutingModule],
  exports: [CabecalhoSimples],
})
export class CabecalhoModule {}