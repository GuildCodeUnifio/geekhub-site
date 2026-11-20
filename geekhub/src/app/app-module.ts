import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { autenticacaoInterceptor } from './api/autenticacao.interceptor';
import { CONFIGURACAO_API, FONTE_DADOS } from './api/configuracao-api';

import { CabecalhoModule } from './cabecalho/cabecalho-module';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, CabecalhoModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([autenticacaoInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: FONTE_DADOS, useValue: CONFIGURACAO_API.fonteDados },
  ],
  bootstrap: [App],
})
export class AppModule {}
