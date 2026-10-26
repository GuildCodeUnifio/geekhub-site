import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrarComponente } from './entrar/entrar.componente';

const routes: Routes = [
    {
        path: 'entrar',
        component: EntrarComponente
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AutenticacaoRoutingModule { }
