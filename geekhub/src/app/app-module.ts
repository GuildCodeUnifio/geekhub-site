import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { CabecalhoModule } from './cabecalho/cabecalho-module';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, CabecalhoModule],
  providers: [provideBrowserGlobalErrorListeners(), { provide: LOCALE_ID, useValue: 'pt-BR' }],
  bootstrap: [App],
})
export class AppModule {}
