import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

interface PerfilVendedor {
  identificador: number;
  nome: string;
  foto?: string;
  media: number | null;
  contagem: number;
  membroDesde: number;
  vendas: number;
  taxaResposta: number;
  avaliacoes: {
    identificador: number;
    autor: string;
    nota: number;
    comentario: string;
    data: string;
  }[];
  produtos: {
    identificador: number;
    nome: string;
    preco: number;
    imagem: string;
  }[];
}

@Component({
  selector: 'app-perfil-vendedor',
  standalone: false,
  styleUrl: './perfil-vendedor.componente.scss',
  templateUrl: './perfil-vendedor.componente.html',
})
export class PerfilVendedorComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly vendedores: PerfilVendedor[] = [
    {
      identificador: 2,
      nome: 'Luiz Carlos Oliveira',
      foto: 'imagens/vendedores/vendedor.jpg',
      media: 4.5,
      contagem: 4,
      membroDesde: 2024,
      vendas: 84,
      taxaResposta: 99,
      avaliacoes: [
        {
          identificador: 1,
          autor: 'Mariana',
          nota: 5,
          comentario: 'Ótimo produto e entrega rápida!',
          data: '28/10/2026',
        },
        {
          identificador: 2,
          autor: 'Rafael',
          nota: 5,
          comentario: 'Produto conforme a descrição e bem embalado.',
          data: '25/10/2026',
        },
        {
          identificador: 3,
          autor: 'Camila',
          nota: 4,
          comentario: 'Vendedor muito atencioso. Recomendo!',
          data: '21/10/2026',
        },
        {
          identificador: 4,
          autor: 'Bruno',
          nota: 4,
          comentario: 'O produto chegou em bom estado.',
          data: '18/10/2026',
        },
      ],
      produtos: [
        {
          identificador: 1,
          nome: 'Action figure Naruto',
          preco: 1850,
          imagem: 'imagens/produtos/naruto.jpg',
        },
      ],
    },
  ];

  vendedor: PerfilVendedor | null = null;
  erro = '';
  mostrarTodasAvaliacoes = false;
  mostrarTodosProdutos = false;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.buscarVendedor(params.get('identificador'));
      });
  }

  private buscarVendedor(identificador: string | null): void {
    this.mostrarTodasAvaliacoes = false;
    this.mostrarTodosProdutos = false;

    this.vendedor =
      identificador === null
        ? null
        : (this.vendedores.find(
            vendedor => vendedor.identificador === Number(identificador)
          ) ?? null);

    this.erro = this.vendedor ? '' : 'Vendedor não encontrado.';
  }
}