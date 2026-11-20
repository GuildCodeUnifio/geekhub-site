import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
  /** A aplicação é zoneless: respostas assíncronas da API precisam marcar a view para atualização. */
  private readonly detector = inject(ChangeDetectorRef);

  private readonly app = inject(App);

  vendedor: PerfilVendedor | null = null;
  erro = '';
  carregando = false;
  mostrarTodasAvaliacoes = false;
  mostrarTodosProdutos = false;

  private consultaAtual?: Subscription;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const identificador = Number(params.get('identificador'));

        this.consultaAtual?.unsubscribe();
        this.mostrarTodasAvaliacoes = false;
        this.mostrarTodosProdutos = false;
        this.vendedor = null;
        this.erro = '';

        if (!Number.isInteger(identificador) || identificador < 1) {
          this.erro = 'Vendedor não encontrado.';
          return;
        }

        this.carregando = true;
        this.consultaAtual = this.app.dados.buscarVendedor(identificador).subscribe({
          next: vendedor => {
            this.vendedor = vendedor;
            this.erro = vendedor ? '' : 'Vendedor não encontrado.';
            this.carregando = false;
            this.detector.markForCheck();
          },
          error: (erro: Error) => {
            this.erro = erro.message;
            this.carregando = false;
            this.detector.markForCheck();
          },
        });
      });

    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());
  }
}
