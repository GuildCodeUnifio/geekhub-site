import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, catchError, of, tap } from 'rxjs';

import {
  App,
  type AdicionarAoCarrinhoRequest,
  type AnuncioResponse,
  type ConsultarAnuncioRequest,
  type ResultadoOperacaoCarrinho,
} from '../../app';

export type {
  AdicionarAoCarrinhoRequest,
  AnuncioResponse,
  ConsultarAnuncioRequest,
  ResultadoOperacaoCarrinho,
};

@Component({
  selector: 'app-detalhes-produto',
  standalone: false,
  styleUrl: './detalhes-produto.componente.scss',
  templateUrl: './detalhes-produto.componente.html',
})
export class DetalhesProdutoComponente implements OnInit {
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly app = inject(App);

  readonly anuncio = signal<AnuncioResponse | null>(null);
  readonly imagemSelecionada = signal(0);
  readonly quantidade = signal(1);
  readonly feedbackCarrinho = signal<{ sucesso: boolean; mensagem: string } | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly adicionando = signal(false);

  private consultaAtual?: Subscription;

  ngOnInit(): void {
    this.rota.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parametros) => {
      this.imagemSelecionada.set(0);
      this.quantidade.set(1);
      this.feedbackCarrinho.set(null);

      this.erro.set('');
      this.consultaAtual?.unsubscribe();

      const identificador = Number(parametros.get('identificador'));
      if (!Number.isInteger(identificador) || identificador < 1) {
        this.anuncio.set(null);
        return;
      }

      this.carregando.set(true);
      this.consultaAtual = this.buscarAnuncio({ anuncioIdentificador: identificador }).subscribe({
        next: (anuncio) => {
          this.anuncio.set(anuncio);
          this.carregando.set(false);
        },
        error: (erro: Error) => {
          this.anuncio.set(null);
          this.erro.set(erro.message);
          this.carregando.set(false);
        },
      });
    });

    this.destroyRef.onDestroy(() => this.consultaAtual?.unsubscribe());
  }

  buscarAnuncio(request: ConsultarAnuncioRequest): Observable<AnuncioResponse | null> {
    return this.app.dados.buscarAnuncio(request.anuncioIdentificador);
  }

  selecionarImagem(indice: number, totalImagens: number): void {
    if (Number.isInteger(indice) && indice >= 0 && indice < totalImagens) {
      this.imagemSelecionada.set(indice);
    }
  }

  disponivelParaCompra(anuncio: AnuncioResponse): boolean {
    return anuncio.disponivel !== false && anuncio.estoque > 0;
  }

  podeDiminuir(anuncio: AnuncioResponse): boolean {
    return this.app.quantidadeValida(this.quantidade() - 1, anuncio.estoque);
  }

  podeAumentar(anuncio: AnuncioResponse): boolean {
    return this.app.quantidadeValida(this.quantidade() + 1, anuncio.estoque);
  }

  alterarQuantidade(estoque: number, variacao: -1 | 1): void {
    const novaQuantidade = this.quantidade() + variacao;

    if (this.app.quantidadeValida(novaQuantidade, estoque)) {
      this.quantidade.set(novaQuantidade);
      this.feedbackCarrinho.set(null);
    }
  }

  aoAdicionarAoCarrinho(anuncio: AnuncioResponse): void {
    if (!this.adicionando()) {
      this.adicionarAoCarrinho(anuncio).subscribe();
    }
  }

  adicionarAoCarrinho(
    anuncio: AnuncioResponse,
    quantidade = this.quantidade(),
  ): Observable<ResultadoOperacaoCarrinho> {
    this.feedbackCarrinho.set(null);
    const carrinhoVazio = { compradorIdentificador: 0, itens: [], total: 0 };

    const usuario = this.app.usuarioAtual;
    if (!usuario) {
      const mensagem = 'Entre na sua conta para adicionar produtos ao carrinho.';
      this.feedbackCarrinho.set({ sucesso: false, mensagem });
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: `/produtos/${anuncio.identificador}` },
      });
      return of({ sucesso: false, mensagem, carrinho: carrinhoVazio });
    }

    if (!this.disponivelParaCompra(anuncio)) {
      const mensagem = 'Este anúncio está indisponível para compra no momento.';
      this.feedbackCarrinho.set({ sucesso: false, mensagem });
      return of({ sucesso: false, mensagem, carrinho: carrinhoVazio });
    }

    if (!this.app.quantidadeValida(quantidade, anuncio.estoque)) {
      const mensagem = `Informe uma quantidade inteira entre 1 e ${anuncio.estoque}.`;
      this.feedbackCarrinho.set({ sucesso: false, mensagem });
      return of({ sucesso: false, mensagem, carrinho: carrinhoVazio });
    }

    const request: AdicionarAoCarrinhoRequest = {
      compradorIdentificador: usuario.identificador,
      anuncioIdentificador: anuncio.identificador,
      quantidade,
      nome: anuncio.nome,
      imagem: anuncio.imagens[0] ?? '',
      precoUnitario: anuncio.preco,
      disponivel: anuncio.disponivel ?? true,
      estoqueDisponivel: anuncio.estoque,
    };

    this.adicionando.set(true);

    return this.app.dados.adicionarAoCarrinho(request).pipe(
      catchError((erro: Error) => of({ sucesso: false, mensagem: erro.message, carrinho: carrinhoVazio })),
      tap((resultado) => {
        this.adicionando.set(false);
        this.feedbackCarrinho.set({
          sucesso: resultado.sucesso,
          mensagem: resultado.mensagem,
        });
      }),
    );
  }
}
