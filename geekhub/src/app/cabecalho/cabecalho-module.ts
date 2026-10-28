import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Cabecalho } from './cabecalho/cabecalho';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [Cabecalho],
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  exports: [Cabecalho],
})
export class CabecalhoModule { }
