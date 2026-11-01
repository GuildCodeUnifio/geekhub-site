import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface UsuarioResponse {
  identificador: number;
  nome: string;
  email: string;
  foto?: string;
}
interface ItemMenuNavegacao {
  rotulo: string;
  icone: string;
  caminho: string;
  exigeSessao?: boolean;
}
export interface DadosCabecalho {
  logoUrl: string;
  nomeSistema: string;
}

@Component({
  selector: 'app-cabecalho',
  standalone: false,
  styleUrl: './cabecalho.scss',
  templateUrl: './cabecalho.html',
})
export class Cabecalho {
  @Input() versao: 'Simples' | 'Completa' = 'Completa';
  @Input() usuarioAtual: UsuarioResponse | null = null;
  @Output() sair = new EventEmitter<void>();
  readonly dados: DadosCabecalho = { logoUrl: 'penguin_icon.png', nomeSistema: 'GeekHub' };
  readonly itensMenu: ItemMenuNavegacao[] = [
    { rotulo: 'Catálogo', icone: 'home', caminho: '/' },
    { rotulo: 'Carrinho', icone: 'shopping_cart', caminho: '/carrinho' },
    { rotulo: 'Minhas compras', icone: 'orders', caminho: '/pedidos', exigeSessao: true },
  ];
}
