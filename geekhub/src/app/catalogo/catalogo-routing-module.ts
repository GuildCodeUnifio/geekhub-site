import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoComponente } from './catalogo/catalogo.componente';
import { DetalhesProdutoComponente } from './detalhes-produto/detalhes-produto.componente';

const routes: Routes = [
    {
        path: '',
        component: CatalogoComponente
    },
    
    {
        path: 'produtos/:identificador',  
        component: DetalhesProdutoComponente
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CatalogoRoutingModule { }
