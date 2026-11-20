
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'vendedores',
        loadChildren: () =>
            import('./vendedores/vendedores-module')
                .then(m => m.VendedoresModule),
    },
    {
        path: 'minha-conta',
        loadChildren: () =>
            import('./conta/conta-module')
                .then(m => m.ContaModule),
    },
    {
        path: 'carrinho',
        loadChildren: () =>
            import('./carrinho/carrinho-module')
                .then(m => m.CarrinhoModule),
    },
    {
        path: 'pedidos',
        loadChildren: () =>
            import('./pedidos/pedidos-module')
                .then(m => m.PedidosModule),
    },
    {
        path: 'meus-anuncios',
        loadChildren: () =>
            import('./anuncios/anuncios-module')
                .then(m => m.AnunciosModule),
    },
    {
        path: 'categorias',
        loadChildren: () =>
            import('./categorias/categorias-module')
                .then(m => m.CategoriasModule),
    },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./dashboard/dashboard-module')
                .then(m => m.DashboardModule),
    },
    {
        path: 'autenticacao',
        loadChildren: () =>
            import('./autenticacao/autenticacao-module')
                .then(m => m.AutenticacaoModule),
    },
    {
        path: '',
        loadChildren: () =>
            import('./catalogo/catalogo-module')
                .then(m => m.CatalogoModule),
    },
    {
        path: '',
        loadChildren: () =>
            import('./autenticacao/autenticacao-module')
                .then(m => m.AutenticacaoModule),
    },
    {
        path: '**',
        redirectTo: '/',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }