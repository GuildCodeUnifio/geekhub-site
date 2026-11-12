import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { App, type PerfilVendedor } from '../../app';

@Component({
  selector: 'app-perfil-vendedor',
  standalone: false,
  styleUrl: './perfil-vendedor.componente.scss',
  templateUrl: './perfil-vendedor.componente.html',
})

export class PerfilVendedorComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly app = inject(App);

  vendedor: PerfilVendedor | null = null;
  erro = '';
  mostrarTodasAvaliacoes = false;
  mostrarTodosProdutos = false;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const identificador = params.get('identificador');

        this.vendedor = identificador === null
          ? null
          : this.app.buscarVendedor(Number(identificador));
        
        this.erro = this.vendedor ? '' : 'Vendedor não encontrado.';
        this.mostrarTodasAvaliacoes = false;
        this.mostrarTodosProdutos = false;
      });
  }
}
