import { Component } from '@angular/core';

export interface ItemMenuCabecalho {
  rotulo: string;
  icone: string;
}

export interface UsuarioCabecalho {
  nome: string;
  fotoUrl: string;
}

export interface DadosCabecalho {
  logoUrl: string;
  nomeSistema: string;
  menu: ItemMenuCabecalho[];
  usuario: UsuarioCabecalho | null;
}

@Component({
  selector: 'app-cabecalho',
  standalone: false,
  styleUrl: './cabecalho.scss',
  templateUrl: './cabecalho.html',
})
export class Cabecalho {
  readonly dados: DadosCabecalho = {
    logoUrl: 'penguin_icon.png',
    nomeSistema: 'GeekHub',
    menu: [
      { rotulo: 'Início', icone: 'home' },
      { rotulo: 'Categorias', icone: 'category' },
      { rotulo: 'Contato', icone: 'mail' },
    ],
    usuario: {
      nome: 'Aluno exemplo',
      fotoUrl: 'https://picsum.photos/seed/geekhub/64',
    },
  };
}
