import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormularioAnuncioComponente } from './formulario-anuncio/formulario-anuncio.componente';
import { MeusAnunciosComponente } from './meus-anuncios/meus-anuncios.componente';

const routes: Routes = [
  {
    path: '',
    component: MeusAnunciosComponente,
  },
  {
    path: 'novo',
    component: FormularioAnuncioComponente,
  },
  {
    path: ':id/editar',
    component: FormularioAnuncioComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnunciosRoutingModule {}
