import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContaRoutingModule } from './conta-routing-module';
import { EditarPerfilComponente } from './editar-perfil/editar-perfil.componente';

@NgModule({
  declarations: [EditarPerfilComponente],
  imports: [CommonModule, ContaRoutingModule],
})
export class ContaModule {}
