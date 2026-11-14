import {
  afterNextRender,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

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
  @Output() buscar = new EventEmitter<string>();
  @Output() sair = new EventEmitter<void>();
  @ViewChild('campoBusca', { read: ElementRef }) campoBusca?: ElementRef<HTMLInputElement>;
  @ViewChild('botaoBusca', { read: ElementRef }) botaoBusca?: ElementRef<HTMLButtonElement>;
  @ViewChild('menuLateral') menuLateral?: MatSidenav;

  buscaAberta = false;
  termoBusca = '';

  readonly dados: DadosCabecalho = {
    logoUrl: 'penguin_icon.png',
    nomeSistema: 'GeekHub',
  };

  readonly itensMenu: ItemMenuNavegacao[] = [
    { rotulo: 'Catálogo', icone: 'home', caminho: '/' },
    { rotulo: 'Carrinho', icone: 'shopping_cart', caminho: '/carrinho' },
    { rotulo: 'Minhas compras', icone: 'orders', caminho: '/pedidos', exigeSessao: true },
  ];

  constructor(private injetor: Injector) {}

  abrirBusca(): void {
    this.buscaAberta = true;
    afterNextRender(() => this.campoBusca?.nativeElement.focus(), { injector: this.injetor });
  }

  fecharBusca(): void {
    this.buscaAberta = false;
    afterNextRender(() => this.botaoBusca?.nativeElement.focus(), { injector: this.injetor });
  }

  pesquisar(): void {
    void this.menuLateral?.close();
    this.buscar.emit(this.termoBusca.trim());
  }
}
