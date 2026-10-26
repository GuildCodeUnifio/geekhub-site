import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarPerfilComponente } from './editar-perfil/editar-perfil.componente';

const routes: Routes = [
  {
    path: 'perfil',
    component: EditarPerfilComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContaRoutingModule {}
