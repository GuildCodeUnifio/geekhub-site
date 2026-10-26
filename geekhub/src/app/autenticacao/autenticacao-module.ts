import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticacaoRoutingModule } from './autenticacao-routing-module';
import { EntrarComponente } from './entrar/entrar.componente';

@NgModule({
  declarations: [EntrarComponente],
  imports: [CommonModule, AutenticacaoRoutingModule],
})
export class AutenticacaoModule {}
