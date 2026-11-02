import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CabecalhoModule } from '../cabecalho/cabecalho-module';
import { AutenticacaoRoutingModule } from './autenticacao-routing-module';
import { EntrarComponente } from './entrar/entrar.componente';
import { CadastroComponente } from './cadastro/cadastro.componente';

@NgModule({
  declarations: [EntrarComponente, CadastroComponente],
  imports: [
    CommonModule,
    FormsModule,
    AutenticacaoRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CabecalhoModule,
    MatSnackBarModule,
  ],
})
export class AutenticacaoModule {}