import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { App } from '../../app';

@Component({
  selector: 'app-catalogo',
  standalone: false,
  styleUrl: './catalogo.componente.scss',
  templateUrl: './catalogo.componente.html',
})
export class CatalogoComponente implements OnInit, OnDestroy {
  readonly anuncios = inject(App).listarAnuncios();
  buscaAplicada = '';
  private assinaturaRota?: Subscription;

  constructor(
    private rota: ActivatedRoute,
    private detector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assinaturaRota = this.rota.queryParamMap.subscribe((parametros) => {
      this.buscaAplicada = parametros.get('busca') ?? '';
      this.detector.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.assinaturaRota?.unsubscribe();
  }
}
