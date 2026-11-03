import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntrarComponente } from './entrar/entrar.componente';
import { CadastroComponente } from './cadastro/cadastro.componente';

const routes: Routes = [
    {
        path: 'entrar',
        component: EntrarComponente
    },
    {
        path: 'cadastro',
        component: CadastroComponente
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AutenticacaoRoutingModule { }
