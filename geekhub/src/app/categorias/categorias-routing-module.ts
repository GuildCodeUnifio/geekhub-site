import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GerenciarCategoriasComponente } from './gerenciar-categorias/gerenciar-categorias.componente';

const routes: Routes = [
  {
    path: '',
    component: GerenciarCategoriasComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriasRoutingModule {}
