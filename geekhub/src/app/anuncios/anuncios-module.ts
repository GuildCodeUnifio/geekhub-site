import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { criarPaginadorPtBr } from '../catalogo/catalogo-module';
import { AnunciosRoutingModule } from './anuncios-routing-module';
import { FormularioAnuncioComponente } from './formulario-anuncio/formulario-anuncio.componente';
import { MeusAnunciosComponente } from './meus-anuncios/meus-anuncios.componente';

@NgModule({
  declarations: [MeusAnunciosComponente, FormularioAnuncioComponente],
  imports: [
    CommonModule,
    FormsModule,
    AnunciosRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: criarPaginadorPtBr }],
})
export class AnunciosModule {}
