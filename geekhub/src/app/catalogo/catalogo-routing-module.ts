import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoComponente } from './catalogo/catalogo.componente';

const routes: Routes = [
    {
        path: '',
        component: CatalogoComponente
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CatalogoRoutingModule { }
