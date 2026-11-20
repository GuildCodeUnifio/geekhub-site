import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ContaRoutingModule } from './conta-routing-module';
import { EditarPerfilComponente } from './editar-perfil/editar-perfil.componente';

@NgModule({
  declarations: [EditarPerfilComponente],
  imports: [
    CommonModule,
    FormsModule,
    ContaRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
})
export class ContaModule {}
