import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CategoriasRoutingModule } from './categorias-routing-module';
import { GerenciarCategoriasComponente } from './gerenciar-categorias/gerenciar-categorias.componente';

@NgModule({
  declarations: [GerenciarCategoriasComponente],
  imports: [
    CommonModule,
    FormsModule,
    CategoriasRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
})
export class CategoriasModule {}
