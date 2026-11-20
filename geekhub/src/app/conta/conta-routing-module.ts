import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarPerfilComponente } from './editar-perfil/editar-perfil.componente';
import { GerenciarUsuariosComponente } from './gerenciar-usuarios/gerenciar-usuarios.componente';

const routes: Routes = [
  {
    path: 'perfil',
    component: EditarPerfilComponente,
  },
  {
    path: 'usuarios',
    component: GerenciarUsuariosComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContaRoutingModule {}
