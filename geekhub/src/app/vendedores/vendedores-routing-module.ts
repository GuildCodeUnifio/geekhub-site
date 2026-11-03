import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilVendedorComponente } from './perfil-vendedor/perfil-vendedor.componente';

const routes: Routes = [
  {
    path: ':id',
    component: PerfilVendedorComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendedoresRoutingModule {}
