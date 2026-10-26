import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendedoresRoutingModule } from './vendedores-routing-module';
import { PerfilVendedorComponente } from './perfil-vendedor/perfil-vendedor.componente';

@NgModule({
  declarations: [PerfilVendedorComponente],
  imports: [CommonModule, VendedoresRoutingModule],
})
export class VendedoresModule {}
