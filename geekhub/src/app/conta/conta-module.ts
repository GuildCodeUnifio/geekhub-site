import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { criarPaginadorPtBr } from '../catalogo/catalogo-module';
import { ContaRoutingModule } from './conta-routing-module';
import { EditarPerfilComponente } from './editar-perfil/editar-perfil.componente';
import { GerenciarUsuariosComponente } from './gerenciar-usuarios/gerenciar-usuarios.componente';

@NgModule({
  declarations: [EditarPerfilComponente, GerenciarUsuariosComponente],
  imports: [
    CommonModule,
    FormsModule,
    ContaRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSlideToggleModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: criarPaginadorPtBr }],
})
export class ContaModule {}
