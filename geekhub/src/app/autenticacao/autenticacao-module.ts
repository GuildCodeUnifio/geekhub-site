import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticacaoRoutingModule } from './autenticacao-routing-module';
import { EntrarComponente } from './entrar/entrar.componente';
import { CadastroComponente } from './cadastro/cadastro.componente';

@NgModule({
  declarations: [EntrarComponente, CadastroComponente],
  imports: [CommonModule, AutenticacaoRoutingModule],
})
export class AutenticacaoModule {}
