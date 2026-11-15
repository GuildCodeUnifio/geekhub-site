import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cabecalho } from './cabecalho/cabecalho';

const routes: Routes = [
    {
        path: '',
        component: Cabecalho,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CabecalhoRoutingModule {}
